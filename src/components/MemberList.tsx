import { css } from '@emotion/core';
import { message, Modal } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Avatar, EmptyTip, Icon, List, ListItem, RoleSelect } from '.';
import api, { resultTypes } from '../apis';
import { GroupTypes } from '../apis/type';
import { TEAM_PERMISSION } from '../constants';
import { FC, Project, Role, UserTeam } from '../interfaces';
import { AppState } from '../store';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { getCancelToken } from '../utils/api';
import { can } from '../utils/user';
import { Spin } from './Spin';
import { TypeData } from './TypeRadioGroup';

/** 成员设置页的属性接口 */
interface MemberListProps {
  groupType: GroupTypes;
  currentGroup: UserTeam | Project;
  className?: string;
}
/**
 * 成员设置页
 */
export const MemberList: FC<MemberListProps> = ({
  groupType,
  currentGroup,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const userID = useSelector((state: AppState) => state.user.id);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [items, setItems] = useState<any[]>([]); // 元素
  const [types, setTypes] = useState<Role[]>(); // 系统角色
  // 弹出框
  const [spinningIDs, setSpinningIDs] = useState<string[]>([]); // 删除请求中

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
        return result.data as TypeData[];
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
      .getMembers({
        groupType,
        groupID: currentGroup.id,
        params: {
          page,
          limit: pageSize,
          word,
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

  /** 修改用户角色 */
  const handleRoleChange = (user: any, roleID: string) => {
    setSpinningIDs((ids) => [user.id, ...ids]);
    api
      .editMember({
        groupType,
        groupID: currentGroup.id,
        userID: user.id,
        data: {
          roleID,
        },
      })
      .then((result) => {
        message.success(result.data.message);
        // 修改数据
        setItems((items) => {
          return items.map((item) => {
            // 获取设置后和 roleID，并赋值
            const newRole = types?.find((type) => type.id === roleID);
            if (item.id === user.id) {
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
        setSpinningIDs((ids) => ids.filter((id) => id !== user.id));
      });
  };

  /** 删除用户确认 */
  const showDeleteUserConfirm = (user: any) => {
    Modal.confirm({
      title:
        userID === user.id
          ? formatMessage({ id: 'team.leave' })
          : formatMessage({ id: 'team.deleteUser' }),
      content:
        userID === user.id
          ? formatMessage({ id: 'team.leaveConfirm' })
          : formatMessage(
              { id: 'team.deleteUserConfirm' },
              { user: user.name },
            ),
      onOk: () => {
        setSpinningIDs((ids) => [user.id, ...ids]);
        api
          .deleteMember({
            groupType,
            groupID: currentGroup.id,
            userID: user.id,
          })
          .then((result) => {
            setSpinningIDs((ids) => ids.filter((id) => id !== user.id));
            // 删除用户从列表中删除用户
            setItems((items) => {
              return items.filter((item) => item.id !== user.id);
            });
            message.success(result.data.message);
          })
          .catch((error) => {
            setSpinningIDs((ids) => ids.filter((id) => id !== user.id));
            error.default();
          });
      },
      onCancel: () => {},
      okText: formatMessage({ id: 'form.ok' }),
      cancelText: formatMessage({ id: 'form.cancel' }),
    });
  };

  return (
    <List
      className={classNames(['MemberList', className])}
      css={css`
        /* 使搜索框上边距和左右一致 */
        margin-top: 7.5px;
      `}
      onChange={handleChange}
      loading={loading}
      total={total}
      itemHeight={87}
      searchInputProps={{
        placeholder: formatMessage({ id: 'site.memberName' }),
      }}
      paginationProps={{
        disabled: spinningIDs.length > 0,
      }}
      items={items}
      itemCreater={(item) => {
        return (
          <Spin spinning={spinningIDs.indexOf(item.id) > -1}>
            <ListItem
              logo={<Avatar type="user" url={item.avatar} />}
              name={item.name}
              rightButton={
                // 创建者无法删除/退出
                item.role.systemCode !== 'creator' &&
                can(currentGroup, TEAM_PERMISSION.DELETE_USER) &&
                currentGroup.role.level > item.role.level && (
                  <Icon icon="times" />
                )
              }
              onRightButtonClick={() => {
                // 显示删除用户模态框
                showDeleteUserConfirm(item);
              }}
              content={
                <div
                  css={css`
                    width: 100%;
                    margin: 5px 0;
                    padding: 0 ${style.paddingBase}px;
                  `}
                >
                  <RoleSelect
                    roles={types}
                    user={item}
                    group={currentGroup}
                    onChange={(user, roleID) => {
                      handleRoleChange(user, roleID);
                    }}
                  />
                </div>
              }
            />
          </Spin>
        );
      }}
      multiColumn={!isMobile}
      columnWidth={300}
      searchEmptyTipCreater={(word) => {
        return (
          <EmptyTip
            text={formatMessage({ id: 'team.noMemberSearchTip' }, { word })}
          />
        );
      }}
    />
  );
};
