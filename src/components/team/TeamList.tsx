import { Button } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { Avatar, EmptyTip, Icon, List, ListItem } from '@/components';
import { api, resultTypes } from '@/apis';
import { FC, UserTeam } from '@/interfaces';
import { AppState } from '@/store';
import { resetProjectSetsState } from '@/store/projectSet/slice';
import { clearTeams, createTeam, setTeamsState } from '@/store/team/slice';
import { toLowerCamelCase } from '@/utils';
import { LIST_ITEM_DEFAULT_HEIGHT } from '@/components/shared/ListItem';

/** 团队列表的属性接口 */
interface TeamListProps {
  className?: string;
}
/**
 * 团队列表
 */
export const TeamList: FC<TeamListProps> = ({ className } = {}) => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const teams = useSelector((state: AppState) => state.team.teams);
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); // 元素总个数

  const defaultPage = useSelector(
    (state: AppState) => state.team.teamsState.page,
  );
  const defaultWord = useSelector(
    (state: AppState) => state.team.teamsState.word,
  );
  const defaultScrollTop = useSelector(
    (state: AppState) => state.team.teamsState.scrollTop,
  );

  /** 获取元素 */
  const handleChange = ({
    page,
    pageSize,
    word,
    cancelToken,
  }: {
    page: number;
    pageSize: number;
    word?: string;
    cancelToken: CancelToken;
  }) => {
    setLoading(true);
    dispatch(clearTeams());
    return api.team
      .getUserTeams({
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
        for (const team of result.data) {
          dispatch(createTeam({ team: toLowerCamelCase<UserTeam>(team) }));
        }
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
    <List
      className={classNames(['TeamList', className])}
      onChange={handleChange}
      loading={loading}
      total={total}
      items={teams}
      itemHeight={LIST_ITEM_DEFAULT_HEIGHT}
      itemCreater={(team) => {
        return (
          <ListItem
            onClick={() => {
              dispatch(resetProjectSetsState());
              history.push(`/dashboard/teams/${team.id}`);
            }}
            active={
              matchPath(location.pathname, {
                path: `/dashboard/teams/${team.id}`,
              }) !== null
            }
            className="TeamList__Item"
            logo={<Avatar type="team" url={team.avatar} />}
            name={team.name}
            rightButton={<Icon icon="cog"></Icon>}
            onRightButtonClick={() => {
              history.push(`/dashboard/teams/${team.id}/setting`);
            }}
          />
        );
      }}
      emptyTipCreater={() => {
        return (
          <EmptyTip
            className="TeamList__EmptyTip"
            text={formatMessage({ id: 'team.emptyTip' })}
            buttons={
              <Button
                onClick={() => {
                  history.push('/dashboard/new-team');
                }}
              >
                {formatMessage({ id: 'site.create' })}
              </Button>
            }
          />
        );
      }}
      searchEmptyTipCreater={(word) => {
        return (
          <EmptyTip
            className="TeamList__EmptyTip"
            text={formatMessage({ id: 'team.emptySearchTip' }, { word })}
          />
        );
      }}
      defaultPage={defaultPage}
      onPageChange={(page) => {
        dispatch(setTeamsState({ page }));
      }}
      defaultWord={defaultWord}
      onWordChange={(word) => {
        dispatch(setTeamsState({ word }));
      }}
      defaultScrollTop={defaultScrollTop}
      onScrollTopChange={(scrollTop) => {
        dispatch(setTeamsState({ scrollTop }));
      }}
    />
  );
};
