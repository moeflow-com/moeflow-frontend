import { css } from '@emotion/core';
import { Icon, Spin } from '@/components';
import { Drawer, message, Modal, Select } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Avatar, EmptyTip, InviteUser, List, ListItem } from '@/components';
import api, { resultTypes } from '@/apis';
import { GroupTypes } from '@/apis/type';
import { AppState } from '@/store';
import style from '@/style';
import { UserTeam, Role, Project } from '@/interfaces';
import { toLowerCamelCase } from '@/utils';
import { getCancelToken } from '@/utils/api';
import { FC } from '@/interfaces';
import { clickEffect } from '@/utils/style';
import { INVITATION_STATUS } from '@/constants';

const { Option } = Select;

/** 邀请管理页的属性接口 */
interface InvitationListProps {
  groupType: GroupTypes;
  currentGroup: UserTeam | Project;
  className?: string;
}
/**
 * 邀请管理页
 */
export const InvitationList: FC<InvitationListProps> = ({
  groupType,
  currentGroup,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [items, setItems] = useState<any[]>([]); // 元素
  const [types, setTypes] = useState<Role[]>(); // 系统角色
  // 弹出框
  const [spinningIDs, setSpinningIDs] = useState<string[]>([]); // 删除请求中
  const [drawerVisible, setDrawerVisible] = useState(false);

  /** 挂载时获取用户角色 */
  useEffect(() => {
    const [cancelToken, cancel] = getCancelToken();
    getTypes({ cancelToken });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 获取系统角色 */
  const getTypes = ({ cancelToken }: { cancelToken?: CancelToken } = {}) => {
    return api
      .getTypes({
        typeName: 'systemRole',
        groupType,
        configs: {
          cancelToken,
        },
      })
      .then((result) => {
        setTypes(result.data);
        return result.data as Role[];
      })
      .catch((error) => {
        error.default();
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
      .getInvitations({
        groupType,
        groupID: currentGroup.id,
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
        setItems(result.data?.map((item: any) => toLowerCamelCase(item)));
      })
      .catch((error) => {
        // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
        if (error.type !== resultTypes.CANCEL_FAILURE) {
          setLoading(false);
        }
        error.default();
      });
  };

  /** 处理邀请成功 */
  const handleInviteSuccess = (invitation: any) => {
    if (invitation) {
      setItems((items) => [invitation, ...items]);
    }
  };

  /** 修改邀请角色 */
  const handleRoleChange = (invitation: any, role: string) => {
    setSpinningIDs((ids) => [invitation.id, ...ids]);
    api
      .editInvitation({
        invitationID: invitation.id,
        data: {
          roleID: role,
        },
      })
      .then((result) => {
        message.success(result.data.message);
        // 修改数据
        setItems((items) => {
          return items.map((item) => {
            // 获取设置后和 role，并赋值
            const newRole = types?.find((type) => type.id === role);
            if (item.id === invitation.id) {
              item.role = newRole;
            }
            return item;
          });
        });
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setSpinningIDs((ids) => ids.filter((id) => id !== invitation.id));
      });
  };

  /** 删除邀请确认 */
  const showDeleteInvitationConfirm = (invitation: any) => {
    Modal.confirm({
      title: formatMessage({ id: 'invitation.deleteInvitation' }),
      content: formatMessage(
        { id: 'invitation.deleteInvitationTip' },
        { user: invitation.user.name },
      ),
      onOk: () => {
        setSpinningIDs((ids) => [invitation.id, ...ids]);
        api
          .deleteInvitation({
            invitationID: invitation.id,
          })
          .then((result) => {
            setSpinningIDs((ids) => ids.filter((id) => id !== invitation.id));
            // 删除用户从列表中删除用户
            setItems((items) => {
              return items.filter((item) => item.id !== invitation.id);
            });
            message.success(result.data.message);
          })
          .catch((error) => {
            setSpinningIDs((ids) => ids.filter((id) => id !== invitation.id));
            error.default();
          });
      },
      onCancel: () => {},
      okText: formatMessage({ id: 'form.ok' }),
      cancelText: formatMessage({ id: 'form.cancel' }),
    });
  };

  return (
    <div
      className={classNames('InvitationList', className)}
      css={css`
        width: 100%;
        flex: auto;
        display: flex;
        flex-direction: column;
        .go-invite {
          height: 40px;
          line-height: 40px;
          text-align: center;
          border-bottom: 1px solid ${style.borderColorLight};
          ${clickEffect()};
          .go-invite-icon {
            margin-right: 5px;
            color: ${style.textColorSecondary};
          }
        }
      `}
    >
      <div
        className="go-invite"
        onClick={() => {
          setDrawerVisible(true);
        }}
      >
        <Icon icon="plus" className="go-invite-icon" />
        <span className="go-invite-text">
          {formatMessage({ id: 'invitation.inviteUser' })}
        </span>
      </div>
      <List
        searchInputVisible={false}
        css={css`
          /* 使搜索框上边距和左右一致 */
          margin-top: 7.5px;
        `}
        onChange={handleChange}
        loading={loading}
        total={total}
        itemHeight={87}
        paginationProps={{
          disabled: spinningIDs.length > 0,
        }}
        items={items}
        itemCreater={(item) => {
          return (
            <Spin spinning={spinningIDs.indexOf(item.id) > -1}>
              <ListItem
                logo={<Avatar type="user" url={item.user.avatar} />}
                name={
                  <div>
                    <div>{item.user.name}</div>
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
                rightButton={
                  item.status === INVITATION_STATUS.PENDING &&
                  currentGroup.role.level > item.role.level && ( // 本人角色等级大于邀请角色
                    <Icon icon="times" />
                  )
                }
                onRightButtonClick={() => {
                  // 显示删除用户模态框
                  showDeleteInvitationConfirm(item);
                }}
                content={
                  <div
                    css={css`
                      width: 100%;
                      margin: 5px 0;
                      padding: 0 ${style.paddingBase}px;
                      .result {
                        height: 32px;
                        line-height: 30px;
                        border: 1px solid ${style.borderColorLight};
                        border-radius: ${style.borderRadiusBase};
                        background-color: ${style.backgroundColorLight};
                        text-align: center;
                        .icon {
                          margin-right: 5px;
                        }
                      }
                    `}
                  >
                    {item.status === INVITATION_STATUS.PENDING ? (
                      <Select
                        disabled={
                          !types || currentGroup.role.level <= item.role.level
                        }
                        loading={!types}
                        defaultValue={item.role.id}
                        value={item.role.id}
                        style={{ width: '100%' }}
                        onChange={(value: SelectValue) => {
                          handleRoleChange(item, value as string);
                        }}
                      >
                        {types?.map((type) => {
                          return (
                            <Option
                              value={type.id}
                              key={type.id}
                              disabled={currentGroup.role.level <= type.level}
                            >
                              {type.name}
                            </Option>
                          );
                        })}
                      </Select>
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
            <EmptyTip text={formatMessage({ id: 'invitation.emptyTip' })} />
          );
        }}
      />
      {/* 邀请用户弹出框 */}
      <Drawer
        css={css`
          .ant-drawer-body {
            padding: 0;
            display: flex;
            flex-direction: column;
          }
        `}
        title={formatMessage({ id: 'invitation.inviteUser' })}
        placement={isMobile ? 'bottom' : 'right'}
        closable={false}
        width={320}
        height="80%"
        onClose={() => {
          setDrawerVisible(false);
        }}
        open={drawerVisible}
      >
        <InviteUser
          onInviteSuccess={handleInviteSuccess}
          groupType={groupType}
          currentGroup={currentGroup}
        />
      </Drawer>
    </div>
  );
};
