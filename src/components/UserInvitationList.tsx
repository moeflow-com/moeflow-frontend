import { css } from '@emotion/core';
import { message } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, EmptyTip, Icon, List, ListItem } from '.';
import api, { resultTypes } from '../apis';
import { APIInvitation } from '../apis/invitation';
import { INVITATION_STATUS } from '../constants';
import { FC, UserTeam } from '../interfaces';
import { AppState } from '../store';
import { setNewInvitationsCount } from '../store/site/slice';
import { createTeam } from '../store/team/slice';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { clickEffect } from '../utils/style';
import { Spin } from './shared/Spin';

/** 申请管理页的属性接口 */
interface UserInvitationListProps {
  className?: string;
}
/**
 * 申请管理页
 */
export const UserInvitationList: FC<UserInvitationListProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [items, setItems] = useState<APIInvitation[]>([]); // 元素
  const newInvitationsCount = useSelector(
    (state: AppState) => state.site.newInvitationsCount,
  );
  // 弹出框
  const [spinningIDs, setSpinningIDs] = useState<string[]>([]); // 删除请求中

  /** 处理申请 */
  const dealInvitation = (invitation: APIInvitation, allow: boolean) => {
    setSpinningIDs((ids) => [invitation.id, ...ids]);
    api
      .dealInvitation({
        invitationID: invitation.id,
        data: { allow },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        message.success(data.message);
        // 如果是团队则加入侧边栏
        if (allow && invitation.groupType === 'team') {
          dispatch(createTeam({ team: data.group as UserTeam, unshift: true }));
        }
        // 修改数据
        setItems((items) => {
          return items.map((item) => {
            // 改变状态
            if (item.id === invitation.id) {
              item.status = allow
                ? INVITATION_STATUS.ALLOW
                : INVITATION_STATUS.DENY;
            }
            return item;
          });
        });
        // 更新数量
        dispatch(setNewInvitationsCount(newInvitationsCount - 1));
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setSpinningIDs((ids) => ids.filter((id) => id !== invitation.id));
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
    api
      .getUserInvitations({
        params: {
          page,
          limit: pageSize,
        },
        configs: {
          cancelToken,
        },
      })
      .then((result) => {
        // 设置数量
        setTotal(result.headers['x-pagination-count']);
        setLoading(false);
        // 转成大写
        setItems(result.data.map((item) => toLowerCamelCase(item)));
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
      className={classNames('UserInvitationList', className)}
      css={css`
        width: 100%;
        height: 100%;
        flex: auto;
        display: flex;
        flex-direction: column;
        .UserInvitationList__GroupNameToIcon {
          margin: 0 3px;
        }
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
        itemHeight={125}
        itemCreater={(item) => {
          return (
            <Spin spinning={spinningIDs.indexOf(item.id) > -1}>
              <ListItem
                logo={
                  item.groupType === 'team' && (
                    <Avatar type="team" url={item.group.avatar} />
                  )
                }
                name={
                  <div>
                    <div>
                      <strong>
                        {formatMessage({ id: 'site.' + item.groupType })}
                        {': '}
                      </strong>
                      {item.groupType === 'project'
                        ? item.group.projectSet.default
                          ? formatMessage({ id: 'projectSet.default' })
                          : item.group.projectSet.name
                        : ''}
                      {item.groupType === 'project' && (
                        <Icon
                          className="UserInvitationList__GroupNameToIcon"
                          icon="angle-right"
                        />
                      )}
                      {item.group.name}
                    </div>
                    {item.operator && (
                      <div
                        css={css`
                          color: ${style.textColorSecondary};
                        `}
                      >
                        {formatMessage({ id: 'invitation.operator' })}
                        {item.operator.name}
                      </div>
                    )}
                  </div>
                }
                content={
                  <div
                    css={css`
                      width: 100%;
                      height: 80px;
                      padding: 0 ${style.paddingBase}px;
                      display: flex;
                      flex-direction: column;
                      .message {
                        width: 100%;
                        height: 23px;
                        margin-bottom: 7.5px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        &.empty {
                          color: ${style.textColorSecondary};
                        }
                      }
                      .result {
                        height: 32px;
                        line-height: 30px;
                        border: 1px solid ${style.borderColorLight};
                        background-color: ${style.backgroundColorLight};
                        border-radius: ${style.borderRadiusBase};
                        text-align: center;
                        .icon {
                          margin-right: 5px;
                        }
                      }
                      .buttons {
                        width: 100%;
                        height: 32px;
                        line-height: 30px;
                        display: flex;
                        .button {
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
                      }
                    `}
                  >
                    <div className={classNames('message')}>
                      {formatMessage(
                        { id: 'me.invitation.asRole' },
                        { role: item.role.name },
                      )}
                    </div>
                    {item.status === INVITATION_STATUS.PENDING ? (
                      <div className="buttons">
                        <div
                          className="button"
                          onClick={() => {
                            dealInvitation(item, true);
                          }}
                        >
                          {formatMessage({ id: 'invitation.allow' })}
                        </div>
                        <div
                          className="button"
                          onClick={() => {
                            dealInvitation(item, false);
                          }}
                        >
                          {formatMessage({ id: 'site.deny' })}
                        </div>
                      </div>
                    ) : (
                      <div className="result">
                        {item.status === INVITATION_STATUS.ALLOW ? (
                          <>
                            <Icon icon="check" className="icon" />{' '}
                            {formatMessage({ id: 'invitation.allowed' })}
                          </>
                        ) : (
                          <>
                            <Icon icon="times" className="icon" />{' '}
                            {formatMessage({ id: 'invitation.denied' })}
                          </>
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
            <EmptyTip text={formatMessage({ id: 'me.invitation.emptyTip' })} />
          );
        }}
      />
    </div>
  );
};
