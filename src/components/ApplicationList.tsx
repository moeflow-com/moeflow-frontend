import { css } from '@emotion/core';
import { message } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, EmptyTip, Icon, List, ListItem, RoleSelect } from '.';
import api, { resultTypes } from '../apis';
import { APIApplication } from '../apis/application';
import { GroupTypes } from '../apis/type';
import {
  APPLICATION_STATUS,
  PROJECT_PERMISSION,
  TEAM_PERMISSION,
} from '../constants';
import { FC, Project, UserTeam } from '../interfaces';
import { AppState } from '../store';
import { setRelatedApplicationsCount } from '../store/site/slice';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { formatGroupType } from '../utils/i18n';
import { clickEffect } from '../utils/style';
import { can } from '../utils/user';
import { Spin } from './Spin';

/** 申请管理页的属性接口 */
interface ApplicationListProps {
  type: 'group' | 'related';
  groupType?: GroupTypes;
  currentGroup?: UserTeam | Project;
  className?: string;
}
/**
 * 申请管理页
 */
export const ApplicationList: FC<ApplicationListProps> = ({
  type,
  groupType,
  currentGroup,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [items, setItems] = useState<APIApplication[]>([]); // 元素
  // 弹出框
  const [spinningIDs, setSpinningIDs] = useState<string[]>([]); // 删除请求中
  const relatedApplicationsCount = useSelector(
    (state: AppState) => state.site.relatedApplicationsCount
  );

  /** 处理申请 */
  const dealApplication = (application: APIApplication, allow: boolean) => {
    setSpinningIDs((ids) => [application.id, ...ids]);
    api
      .dealApplication({
        applicationID: application.id,
        data: { allow },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        message.success(data.message);
        // 修改数据
        setItems((items) => {
          return items.map((item) => {
            // 改变状态
            if (item.id === application.id) {
              return data.application;
            }
            return item;
          });
        });
        if (type === 'related') {
          // 更新数量
          dispatch(setRelatedApplicationsCount(relatedApplicationsCount - 1));
        }
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setSpinningIDs((ids) => ids.filter((id) => id !== application.id));
      });
  };

  /** 修改用户角色 */
  const handleRoleChange = ({
    application,
    roleID,
  }: {
    application: APIApplication;
    roleID: string;
  }) => {
    setSpinningIDs((ids) => [application.id, ...ids]);
    api
      .editMember({
        groupID: application.group.id,
        groupType: application.group.groupType,
        userID: application.user.id,
        data: {
          roleID,
        },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        message.success(data.message);
        // 修改数据
        setItems((items) => {
          return items.map((item) => {
            // 改变状态
            if (
              item.user.id === application.user.id &&
              item.group.id === application.group.id
            ) {
              return {
                ...item,
                userRole: data.role,
              };
            }
            return item;
          });
        });
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setSpinningIDs((ids) => ids.filter((id) => id !== application.id));
      });
  };

  /** 获取元素 */
  const handleChange = ({
    page,
    pageSize,
    word,
    cancelToken,
  }: {
    page: number;
    pageSize: number;
    word: string;
    cancelToken: CancelToken;
  }) => {
    setLoading(true);
    let getApplications;
    if (type === 'group') {
      getApplications = api.getApplications({
        groupType: groupType!,
        groupID: currentGroup!.id,
        params: {
          page,
          limit: pageSize,
        },
        configs: {
          cancelToken,
        },
      });
    } else {
      getApplications = api.getRelatedApplications({
        params: {
          page,
          limit: pageSize,
        },
        configs: {
          cancelToken,
        },
      });
    }

    getApplications
      .then((result) => {
        // 设置数量
        setTotal(result.headers['x-pagination-count']);
        setLoading(false);
        // 转成大写
        setItems(result.data?.map((item) => toLowerCamelCase(item)));
      })
      .catch((error) => {
        // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
        if (error.type !== resultTypes.CANCEL_FAILURE) {
          setLoading(false);
        }
        error.default();
      });
  };

  return (
    <div
      className={classNames(className)}
      css={css`
        width: 100%;
        height: 100%;
        flex: auto;
        display: flex;
        flex-direction: column;
      `}
    >
      <List
        searchInputVisible={false}
        css={css`
          /* 使搜索框上边距和左右一致 */
          margin-top: 7.5px;
        `}
        onChange={handleChange}
        loading={loading}
        total={total}
        paginationProps={{
          disabled: spinningIDs.length > 0,
        }}
        items={items}
        itemHeight={152}
        itemCreater={(item) => {
          let changeRoleSelectVisible = false;
          if (item.status === APPLICATION_STATUS.ALLOW) {
            if (
              item.groupType === 'team' &&
              can(item.group, TEAM_PERMISSION.CHANGE_USER_ROLE)
            ) {
              changeRoleSelectVisible = true;
            } else if (
              item.groupType === 'project' &&
              can(item.group, PROJECT_PERMISSION.CHANGE_USER_ROLE)
            ) {
              changeRoleSelectVisible = true;
            }
          }
          return (
            <Spin spinning={spinningIDs.indexOf(item.id) > -1}>
              <ListItem
                logo={<Avatar type="team" url={item.user.avatar} />}
                name={
                  <div>
                    <div>{item.user.name}</div>
                    {item.operator && (
                      <div
                        css={css`
                          color: ${style.textColorSecondary};
                        `}
                      >
                        {item.operator.id === item.user.id
                          ? `[${formatMessage({
                              id: 'application.noNeedCheckAutoAllow',
                            })}]`
                          : formatMessage({ id: 'application.operator' }) +
                            item.operator.name}
                      </div>
                    )}
                  </div>
                }
                content={
                  <div
                    css={css`
                      width: 100%;
                      /* height: 80px; */
                      padding: 0 ${style.paddingBase}px;
                      display: flex;
                      flex-direction: column;
                      .ApplicationList__GroupName {
                        height: 44px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        word-break: break-all;
                      }
                      .ApplicationList__GroupNameToIcon {
                        margin: 0 3px;
                      }
                      .ApplicationList__Message {
                        width: 100%;
                        height: 23px;
                        margin-bottom: 7.5px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      }
                      .ApplicationList__Message--empty {
                        color: ${style.textColorSecondary};
                      }
                      .ApplicationList__Result {
                        flex: 1 0;
                        height: 32px;
                        line-height: 30px;
                        border: 1px solid ${style.borderColorLight};
                        border-radius: ${style.borderRadiusBase};
                        background-color: ${style.backgroundColorLight};
                        text-align: center;
                      }
                      .ApplicationList__ResultIcon {
                        margin-right: 5px;
                      }
                      .ApplicationList__Bottom {
                        width: 100%;
                        height: 32px;
                        line-height: 30px;
                        display: flex;
                      }
                      .ApplicationList__RoleSelect {
                        flex: 1 0;
                        padding-left: ${style.paddingBase / 2}px;
                      }
                      .ApplicationList__RoleSelectUserLeft {
                        flex: 1 0;
                        text-align: center;
                        margin-left: ${style.paddingBase / 2}px;
                        border: 1px solid #eeeeee;
                        border-radius: 8px;
                        color: ${style.textColorSecondary};
                      }
                      .ApplicationList__Button {
                        width: 50%;
                        text-align: center;
                        border: 1px solid ${style.borderColorLight};
                        ${clickEffect()};
                        &:first-of-type {
                          border-right: none;
                          border-radius: ${style.borderRadiusBase} 0 0
                            ${style.borderRadiusBase};
                        }
                        &:last-child {
                          border-radius: 0 ${style.borderRadiusBase}
                            ${style.borderRadiusBase} 0;
                        }
                      }
                    `}
                  >
                    {type === 'related' && (
                      <div className="ApplicationList__GroupName">
                        <strong>
                          {formatMessage(
                            { id: 'site.join.request' },
                            { groupType: formatGroupType(item.groupType) }
                          ) + ': '}
                        </strong>
                        {item.groupType === 'project'
                          ? item.group.projectSet.default
                            ? formatMessage({ id: 'projectSet.default' })
                            : item.group.projectSet.name
                          : ''}
                        {item.groupType === 'project' && (
                          <Icon
                            className="ApplicationList__GroupNameToIcon"
                            icon="angle-right"
                          />
                        )}
                        {item.group.name}
                      </div>
                    )}
                    <div
                      className={classNames([
                        'ApplicationList__Message',
                        {
                          'ApplicationList__Message--empty':
                            item.message === '',
                        },
                      ])}
                    >
                      {item.message ? (
                        <>
                          <strong>
                            {formatMessage({ id: 'application.message' }) +
                              ': '}
                          </strong>
                          {item.message}
                        </>
                      ) : (
                        '[' +
                        formatMessage({ id: 'application.emptyMessage' }) +
                        ']'
                      )}
                    </div>
                    {item.status === APPLICATION_STATUS.PENDING ? (
                      <div className="ApplicationList__Bottom">
                        <div
                          className="ApplicationList__Button"
                          onClick={() => {
                            dealApplication(item, true);
                          }}
                        >
                          {formatMessage({ id: 'site.allow' })}
                        </div>
                        <div
                          className="ApplicationList__Button"
                          onClick={() => {
                            dealApplication(item, false);
                          }}
                        >
                          {formatMessage({ id: 'site.deny' })}
                        </div>
                      </div>
                    ) : (
                      <div className="ApplicationList__Bottom">
                        {item.status === APPLICATION_STATUS.ALLOW ? (
                          <>
                            <div className="ApplicationList__Result">
                              <Icon
                                icon="check"
                                className="ApplicationList__ResultIcon"
                              />{' '}
                              {formatMessage({ id: 'application.allowed' })}
                            </div>
                            {changeRoleSelectVisible &&
                              (item.userRole ? (
                                <RoleSelect
                                  className="ApplicationList__RoleSelect"
                                  roles={item.groupRoles}
                                  user={{ ...item.user, role: item.userRole }}
                                  group={item.group}
                                  onChange={(user, roleID) => {
                                    handleRoleChange({
                                      application: item,
                                      roleID,
                                    });
                                  }}
                                />
                              ) : (
                                <div className="ApplicationList__RoleSelectUserLeft">
                                  {formatMessage({
                                    id: 'application.userLeft',
                                  })}
                                </div>
                              ))}
                          </>
                        ) : (
                          <div className="ApplicationList__Result">
                            <Icon
                              icon="times"
                              className="ApplicationList__ResultIcon"
                            />{' '}
                            {formatMessage({ id: 'application.denied' })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                }
              />
            </Spin>
          );
        }}
        multiColumn={!isMobile}
        columnWidth={300}
        emptyTipCreater={() => {
          return (
            <EmptyTip text={formatMessage({ id: 'application.emptyTip' })} />
          );
        }}
      />
    </div>
  );
};
