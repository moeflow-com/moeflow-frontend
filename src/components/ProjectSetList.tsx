import { CancelToken } from 'axios';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  matchPath,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import { EmptyTip, Icon, List, ListItem } from '.';
import api, { resultTypes } from '../apis';
import { TEAM_PERMISSION } from '../constants';
import { FC, UserProjectSet, UserTeam } from '../interfaces';
import { AppState } from '../store';
import { resetProjectsState } from '../store/project/slice';
import {
  clearProjectSets,
  createProjectSet,
  setProjectSetsState,
} from '../store/projectSet/slice';
import { toLowerCamelCase } from '../utils';
import { can } from '../utils/user';
import { LIST_ITEM_DEFAULT_HEIGHT } from '@/components/shared/ListItem';

/** 项目集的属性接口 */
interface ProjectSetListProps {
  className?: string;
  searchRightButton?: React.ReactNode | React.ReactElement;
  onSearchRightButtonClick?: (e: React.MouseEvent) => void;
}
/**
 * 项目集
 */
export const ProjectSetList: FC<ProjectSetListProps> = ({
  searchRightButton,
  onSearchRightButtonClick,
  className,
}) => {
  const { formatMessage } = useIntl();
  const projectSets = useSelector(
    (state: AppState) => state.projectSet.projectSets,
  );
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { url, path } = useRouteMatch();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); // 元素总个数
  const currentTeam = useSelector(
    (state: AppState) => state.team.currentTeam,
  ) as UserTeam;

  const defaultPage = useSelector(
    (state: AppState) => state.projectSet.projectSetsState.page,
  );
  const defaultWord = useSelector(
    (state: AppState) => state.projectSet.projectSetsState.word,
  );
  const defaultScrollTop = useSelector(
    (state: AppState) => state.projectSet.projectSetsState.scrollTop,
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
    dispatch(clearProjectSets());
    return api
      .getTeamProjectSets({
        teamID: currentTeam.id,
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
        for (const projectSet of result.data) {
          dispatch(
            createProjectSet({
              projectSet: toLowerCamelCase<UserProjectSet>(projectSet),
            }),
          );
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
      id={currentTeam.id}
      className={className}
      onChange={handleChange}
      loading={loading}
      total={total}
      items={projectSets}
      itemHeight={LIST_ITEM_DEFAULT_HEIGHT}
      itemCreater={(projectSet) => {
        return (
          <ListItem
            onClick={() => {
              dispatch(resetProjectsState());
              history.push(`${url}/project-sets/${projectSet.id}`);
            }}
            active={
              matchPath(location.pathname, {
                path: `${path}/project-sets/${projectSet.id}`,
              }) !== null
            }
            className="project-set-list-item"
            name={
              projectSet.default
                ? formatMessage({ id: 'projectSet.default' })
                : projectSet.name
            }
            icon={projectSet.default && <Icon icon="layer-group"></Icon>}
            rightButton={
              can(currentTeam, TEAM_PERMISSION.CHANGE_PROJECT_SET) &&
              !projectSet.default && <Icon icon="cog"></Icon>
            }
            onRightButtonClick={() => {
              history.push(`${url}/project-sets/${projectSet.id}/setting`);
            }}
          />
        );
      }}
      searchEmptyTipCreater={(word) => {
        return (
          <EmptyTip
            text={formatMessage({ id: 'projectSet.emptySearchTip' }, { word })}
          />
        );
      }}
      searchRightButton={searchRightButton}
      onSearchRightButtonClick={onSearchRightButtonClick}
      defaultPage={defaultPage}
      onPageChange={(page) => {
        dispatch(setProjectSetsState({ page }));
      }}
      defaultWord={defaultWord}
      onWordChange={(word) => {
        dispatch(setProjectSetsState({ word }));
      }}
      defaultScrollTop={defaultScrollTop}
      onScrollTopChange={(scrollTop) => {
        dispatch(setProjectSetsState({ scrollTop }));
      }}
    />
  );
};
