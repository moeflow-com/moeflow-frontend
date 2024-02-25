import { css } from '@emotion/core';
import { Icon } from '.';
import { message, Select } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Avatar, EmptyTip, List, ListItem } from '.';
import api, { resultTypes } from '../apis';
import { GroupTypes } from '../apis/type';
import { FC, Role, Project, UserTeam } from '../interfaces';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { getCancelToken } from '../utils/api';
import { Spin } from './Spin';
import { LIST_ITEM_DEFAULT_HEIGHT } from './ListItem';

const { Option } = Select;

/** 邀请用户页的属性接口 */
interface InviteUserProps {
  groupType: GroupTypes;
  currentGroup: UserTeam | Project;
  onInviteSuccess?: (invitation?: any) => void;
  className?: string;
}
/**
 * 邀请用户页
 */
export const InviteUser: FC<InviteUserProps> = ({
  groupType,
  currentGroup,
  onInviteSuccess,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [searchWord, setSearchWord] = useState('');
  const [items, setItems] = useState<any[]>([]); // 元素
  const [types, setTypes] = useState<Role[]>(); // 系统角色
  const [inviteRole, setInviteRole] = useState(''); // 邀请角色
  // 弹出框
  const [spinningIDs] = useState<string[]>([]); // 删除请求中

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
    setSearchWord(word);
    // 没有搜索词不处理
    if (word === '') {
      if (groupType === 'project') {
        setLoading(true);
        api
          .getMembers({
            groupID: (currentGroup as Project).team.id,
            groupType: 'team',
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
      } else {
        setItems([]);
      }
      return;
    }
    setLoading(true);
    api
      .getUsers({
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

  /** 邀请用户 */
  const invite = (user: any) => {
    // role 为空提示选择
    if (inviteRole === '') {
      message.error({
        content: formatMessage({ id: 'invitation.needRole' }),
        key: 'needRole',
      });
      return;
    }
    return api
      .createInvitation({
        groupType,
        groupID: currentGroup.id,
        data: {
          userID: user.id,
          roleID: inviteRole,
          message: '',
        },
      })
      .then((result) => {
        message.success(result.data.message);
        // 邀请用户成功，这里 invitation 可能为空，因为用户可能已经申请，会被直接加入，不生成新的 invitation
        if (onInviteSuccess) {
          onInviteSuccess(result.data.invitation);
        }
      })
      .catch((error) => {
        error.default();
      });
  };

  return (
    <>
      <div
        className={classNames(['InviteUser', className])}
        css={css`
          width: 100%;
          margin: 5px 0;
          padding: 7.5px ${style.paddingBase}px 0 ${style.paddingBase}px;
        `}
      >
        <Select
          loading={!types}
          disabled={!types}
          style={{ width: '100%' }}
          placeholder={formatMessage({ id: 'invitation.needRole' })}
          onChange={(value: SelectValue) => {
            setInviteRole(value as string);
          }}
        >
          {types?.map((type) => {
            return (
              <Option
                value={type.id}
                key={type.id}
                disabled={currentGroup.role.level <= type.level}
              >
                {formatMessage(
                  { id: 'invitation.inviteAsRole' },
                  { role: type.name },
                )}
              </Option>
            );
          })}
        </Select>
      </div>
      <List
        css={css`
          .InviteUser__SearchType {
            padding: 3px ${style.paddingBase}px 5px;
            font-size: 12px;
            font-weight: bold;
            color: ${style.textColorSecondary};
          }
        `}
        onChange={handleChange}
        loading={loading}
        total={total}
        searchInputProps={{
          size: 'middle',
          placeholder: formatMessage({ id: 'site.userName' }),
        }}
        paginationProps={{
          disabled: spinningIDs.length > 0,
        }}
        header={
          groupType === 'project' ? (
            <div className="InviteUser__SearchType">
              {searchWord
                ? formatMessage({ id: 'invitation.searchedUsers' })
                : formatMessage({ id: 'invitation.teamUsers' })}
            </div>
          ) : undefined
        }
        items={items}
        itemHeight={LIST_ITEM_DEFAULT_HEIGHT}
        itemCreater={(item) => {
          return (
            <Spin spinning={spinningIDs.indexOf(item.id) > -1}>
              <ListItem
                logo={<Avatar type="user" url={item.avatar} />}
                name={item.name}
                rightButton={<Icon icon="plus" />}
                onRightButtonClick={() => {
                  // 显示删除用户模态框
                  invite(item);
                }}
              />
            </Spin>
          );
        }}
        emptyTipCreater={() => {
          return (
            <EmptyTip
              text={
                groupType === 'project'
                  ? formatMessage({ id: 'invitation.inviteTipForTeam' })
                  : formatMessage({ id: 'invitation.inviteTip' })
              }
            />
          );
        }}
        searchEmptyTipCreater={(word) => {
          return (
            <EmptyTip
              text={formatMessage(
                { id: 'invitation.emptySearchTip' },
                { word },
              )}
            />
          );
        }}
      />
    </>
  );
};
