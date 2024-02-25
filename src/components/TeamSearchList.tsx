import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Icon } from '.';
import { Button, Input, message, Modal } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Avatar, EmptyTip, List, ListItem } from '.';
import api, { resultTypes } from '../apis';
import { TEAM_ALLOW_APPLY_TYPE } from '../constants';
import { AppState } from '../store';
import { createTeam } from '../store/team/slice';
import { toLowerCamelCase } from '../utils';
import { FC, UserTeam } from '../interfaces';
import { Team } from '../interfaces';
import { LIST_ITEM_DEFAULT_HEIGHT } from './ListItem';

/** 搜索团队的属性接口 */
interface TeamSearchListProps {
  className?: string;
}

/**
 * 搜索团队
 */
export const TeamSearchList: FC<TeamSearchListProps> = ({ className } = {}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const dispatch = useDispatch();
  const history = useHistory(); // 路由
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [teams, setTeams] = useState<Team[]>([]); // 元素总个数
  // 加入申请弹出框
  const [team, setTeam] = useState<Team>(); // 当前点击的 team
  const [reason, setReason] = useState(''); // 申请加入理由
  const [applying, setApplying] = useState(false); // 申请请求中
  const [modelVisible, setModelVisible] = useState(false); // 加入模态框

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
    // 没有 word 不处理
    if (word === '') {
      setTeams([]);
      return;
    }
    setLoading(true);
    api
      .getTeams({
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
        setTeams(result.data?.map((team: any) => toLowerCamelCase(team)));
      })
      .catch((error) => {
        // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
        if (error.type !== resultTypes.CANCEL_FAILURE) {
          setLoading(false);
        }
        error.default();
      });
  };

  /** 处理提交申请 */
  const handleApply = (team: Team, reason: string) => {
    setApplying(true);
    api
      .createApplication({
        groupType: 'team',
        groupID: team.id,
        data: {
          message: reason,
        },
      })
      .then((result) => {
        // 关闭模态框
        setApplying(false);
        setModelVisible(false);
        setReason('');
        const data = toLowerCamelCase(result.data);
        // 弹出提示
        message.success(data.message);
        // 无需审核或之前有邀请，则跳转到所在团队
        if (data.group && data.group.role) {
          // 加入成功
          dispatch(createTeam({ team: data.group as UserTeam, unshift: true }));
          // 跳转到团队
          history.replace(`/dashboard/teams/${data.group.id}`);
        }
      })
      .catch((error) => {
        // 关闭模态框
        setApplying(false);
        setModelVisible(false);
        error.default();
      });
  };

  return (
    <>
      <List
        className={classNames(['TeamSearchList', className])}
        onChange={handleChange}
        loading={loading}
        total={total}
        searchInputProps={{
          size: 'middle',
          placeholder: formatMessage({ id: 'team.name' }),
        }}
        items={teams}
        itemHeight={LIST_ITEM_DEFAULT_HEIGHT}
        itemCreater={(team) => {
          // 设置右侧标记
          let icon: IconProp = 'plus';
          // 不允许申请加入
          if (team.allowApplyType === TEAM_ALLOW_APPLY_TYPE.NONE) icon = 'ban';
          // 已经加入了
          if (team.joined) icon = 'check';
          return (
            <ListItem
              logo={<Avatar type="team" url={team.avatar} />}
              name={team.name}
              icon={<Icon icon={icon}></Icon>}
              onClick={() => {
                setTeam(team);
                // 已经加入了
                if (team.joined) {
                  Modal.info({
                    title: formatMessage({ id: 'team.alreadyJoinedTipTitle' }),
                    content: (
                      <div>
                        {formatMessage(
                          { id: 'team.alreadyJoinedTip' },
                          { team: team.name },
                        )}
                      </div>
                    ),
                    onOk() {},
                    okText: formatMessage({ id: 'form.ok' }),
                  });
                  return;
                }
                // 不允许申请加入
                if (team.allowApplyType === TEAM_ALLOW_APPLY_TYPE.NONE) {
                  Modal.info({
                    title: formatMessage({ id: 'team.notAllowApplyTipTitle' }),
                    content: (
                      <div>
                        {formatMessage(
                          { id: 'team.notAllowApplyTip' },
                          { team: team.name },
                        )}
                      </div>
                    ),
                    onOk() {},
                    okText: formatMessage({ id: 'form.ok' }),
                  });
                  return;
                }
                // 显示（申请）加入模态框
                setModelVisible(true);
              }}
            />
          );
        }}
        multiColumn={!isMobile}
        columnWidth={300}
        emptyTipCreater={() => {
          return (
            <EmptyTip
              text={formatMessage({ id: 'team.searchTip' })}
              buttons={
                <Button
                  type="link"
                  onClick={() => {
                    history.replace(`/dashboard/join-team/create`);
                  }}
                >
                  {formatMessage({ id: 'site.searchToCreateTip' })}
                </Button>
              }
            />
          );
        }}
        searchEmptyTipCreater={(word) => {
          return (
            <EmptyTip
              text={formatMessage({ id: 'team.emptySearchTip' }, { word })}
            />
          );
        }}
      />
      <Modal
        title={
          team?.isNeedCheckApplication
            ? formatMessage({ id: 'team.apply' })
            : formatMessage({ id: 'team.join' })
        }
        closable={false}
        visible={modelVisible}
        onOk={() => {
          handleApply(team as Team, reason);
        }}
        onCancel={() => {
          setModelVisible(false);
          setReason('');
        }}
        okText={
          team?.isNeedCheckApplication
            ? formatMessage({ id: 'site.apply' })
            : formatMessage({ id: 'site.join' })
        }
        cancelText={formatMessage({ id: 'form.cancel' })}
        okButtonProps={{
          loading: applying,
        }}
        cancelButtonProps={{
          disabled: applying,
        }}
      >
        {team?.isNeedCheckApplication ? (
          <>
            <p>
              {formatMessage(
                { id: 'application.reasonLabel' },
                { name: team?.name },
              )}
            </p>
            <Input
              placeholder={formatMessage({ id: 'application.reason' })}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
              }}
            />
          </>
        ) : (
          <div>
            {formatMessage({ id: 'team.applyConfirm' }, { team: team?.name })}
          </div>
        )}
      </Modal>
    </>
  );
};
