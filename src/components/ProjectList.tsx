import { css } from '@emotion/core';
import { Button } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { EmptyTip, List, ProjectItem } from '.';
import api, { resultTypes } from '../apis';
import { PROJECT_STATUS } from '../constants';
import { FC } from '../interfaces';
import { AppState } from '../store';
import {
  clearProjects,
  createProject,
  resetProjectsState,
  setProjectsState,
} from '../store/project/slice';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { clickEffect } from '../utils/style';

/** 项目列表的属性接口 */
interface ProjectListProps {
  from: 'user' | 'team';
  className?: string;
  searchRightButton?: React.ReactNode | React.ReactElement;
  onSearchRightButtonClick?: (e: React.MouseEvent) => void;
}
/**
 * 项目列表
 */
export const ProjectList: FC<ProjectListProps> = ({
  from,
  searchRightButton,
  onSearchRightButtonClick,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const projects = useSelector((state: AppState) => state.project.projects);
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const history = useHistory(); // 路由
  const dispatch = useDispatch();
  const { url } = useRouteMatch();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); // 元素总个数
  // 当 from 为 team 时，才有 currentProjectSet 和 currentTeam
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet,
  );
  const currentUser = useSelector((state: AppState) => state.user);
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );

  const defaultPage = useSelector(
    (state: AppState) => state.project.projectsState.page,
  );
  const defaultWord = useSelector(
    (state: AppState) => state.project.projectsState.word,
  );
  const defaultScrollTop = useSelector(
    (state: AppState) => state.project.projectsState.scrollTop,
  );
  const status = useSelector(
    (state: AppState) => state.project.projectsState.status,
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
    dispatch(clearProjects());
    if (from === 'user') {
      return api
        .getUserProjects({
          params: {
            page,
            limit: pageSize,
            word,
            status,
          },
          configs: {
            cancelToken,
          },
        })
        .then((result) => {
          // 设置数量
          setTotal(result.headers['x-pagination-count']);
          setLoading(false);
          for (const project of result.data) {
            dispatch(createProject({ project: toLowerCamelCase(project) }));
          }
        })
        .catch((error) => {
          // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
          if (error.type !== resultTypes.CANCEL_FAILURE) {
            setLoading(false);
          }
          error.default();
        });
    } else if (from === 'team') {
      return api
        .getTeamProjects({
          teamID: currentTeam!.id,
          projectSetID: currentProjectSet!.id,
          params: {
            page,
            limit: pageSize,
            word,
            status,
          },
          configs: {
            cancelToken,
          },
        })
        .then((result) => {
          // 设置数量
          setTotal(result.headers['x-pagination-count']);
          setLoading(false);
          for (const project of result.data) {
            dispatch(createProject({ project: toLowerCamelCase(project) }));
          }
        })
        .catch((error) => {
          // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
          if (error.type !== resultTypes.CANCEL_FAILURE) {
            setLoading(false);
          }
          error.default();
        });
    }
  };

  // 用于刷新 List 的唯一 ID
  let listID = '';
  if (from === 'user') {
    listID = currentUser.id;
  } else if (from === 'team') {
    listID = currentTeam!.id + currentProjectSet!.id;
  }

  return (
    <List
      id={listID + '-' + status.toString()}
      css={css`
        .List__ItemWrapper {
          padding: 0 ${style.paddingBase}px;
          margin-bottom: ${style.paddingBase}px;
        }
        .ProjectList__Statuses {
          display: flex;
          margin: 0 ${style.paddingBase}px 10px;
          border-radius: ${style.borderRadiusBase};
          overflow: hidden;
          border: 1px solid ${style.borderColorLighter};
        }
        .ProjectList__Status {
          display: flex;
          justify-content: center;
          flex: auto;
          padding: 3px 0;
          font-size: 12px;
          ${clickEffect()};
        }
        .ProjectList__CurrentProject {
          margin: 0 ${style.paddingBase}px ${style.paddingBase / 1.3}px;
          border-bottom: 1px solid ${style.borderColorLight};
        }
        .ProjectList__CurrentProjectTip {
          font-size: 12px;
          font-weight: bold;
          color: ${style.textColorSecondary};
          text-align: center;
          padding: ${style.paddingBase / 2}px 0 ${style.paddingBase / 3}px;
        }
        .ProjectList__Status--active {
          font-weight: bold;
          background: ${style.backgroundColorLight};
        }
      `}
      className={classNames(['ProjectList', className])}
      onChange={handleChange}
      loading={loading}
      total={total}
      items={projects}
      itemHeight={200}
      minPageSize={isMobile ? 10 : 15}
      itemCreater={(project) => <ProjectItem from={from} project={project} />}
      emptyTipCreater={() => {
        if (status === PROJECT_STATUS.WORKING) {
          if (from === 'user') {
            return (
              <EmptyTip
                className="ProjectList__EmptyTip"
                text={formatMessage({ id: 'myProject.emptyTip' })}
              />
            );
          } else if (from === 'team') {
            return (
              <EmptyTip
                className="ProjectList__EmptyTip"
                text={formatMessage({ id: 'project.emptyTip' })}
                buttons={
                  <Button
                    onClick={() => {
                      history.push(`${url}/create-project`);
                    }}
                  >
                    {formatMessage({ id: 'site.create' })}
                  </Button>
                }
              />
            );
          }
        } else {
          return (
            <EmptyTip
              className="ProjectList__EmptyTip"
              text={formatMessage({ id: 'project.emptyFinishedTip' })}
            />
          );
        }
      }}
      searchEmptyTipCreater={(word) => {
        return (
          <EmptyTip
            className="ProjectList__EmptyTip"
            text={formatMessage({ id: 'project.emptySearchTip' }, { word })}
          />
        );
      }}
      searchRightButton={searchRightButton}
      onSearchRightButtonClick={onSearchRightButtonClick}
      defaultPage={defaultPage}
      onPageChange={(page) => {
        dispatch(setProjectsState({ page }));
      }}
      defaultWord={defaultWord}
      onWordChange={(word) => {
        dispatch(setProjectsState({ word }));
      }}
      defaultScrollTop={defaultScrollTop}
      onScrollTopChange={(scrollTop) => {
        dispatch(setProjectsState({ scrollTop }));
      }}
      header={
        <>
          <div className="ProjectList__Statuses">
            <div
              className={classNames('ProjectList__Status', {
                'ProjectList__Status--active':
                  status === PROJECT_STATUS.WORKING,
              })}
              onClick={() => {
                dispatch(resetProjectsState());
                dispatch(setProjectsState({ status: PROJECT_STATUS.WORKING }));
              }}
            >
              {formatMessage({ id: 'project.working' })}
            </div>
            <div
              className={classNames('ProjectList__Status', {
                'ProjectList__Status--active':
                  status === PROJECT_STATUS.FINISHED,
              })}
              onClick={() => {
                dispatch(resetProjectsState());
                dispatch(setProjectsState({ status: PROJECT_STATUS.FINISHED }));
              }}
            >
              {formatMessage({ id: 'project.finished' })}
            </div>
          </div>
          {currentProject &&
            !projects.find((project) => project.id === currentProject.id) && (
              <div className="ProjectList__CurrentProject">
                <ProjectItem from={from} project={currentProject} />
                <div className="ProjectList__CurrentProjectTip">
                  {formatMessage({ id: 'project.current' })}
                </div>
              </div>
            )}
        </>
      }
    />
  );
};
