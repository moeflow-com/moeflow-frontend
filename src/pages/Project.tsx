import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useTitle } from '@/hooks';
import { FC } from '@/interfaces';
import { AppState } from '@/store';
import {
  clearCurrentProject,
  setCurrentProjectSaga,
} from '@/store/project/slice';
import ProjectFiles from './ProjectFiles';
import ProjectPreview from './ProjectPreview';
import ProjectSetting from './ProjectSetting';

/** 项目路由的属性接口 */
interface ProjectProps {}
/**
 * 项目路由
 */
const Project: FC<ProjectProps> = () => {
  useTitle(); // 设置标题
  const { projectID } = useParams<{ projectID: string }>();
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet,
  );
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );

  // 设置当前目标 project
  useEffect(() => {
    dispatch(setCurrentProjectSaga({ id: projectID }));
    return () => {
      dispatch(clearCurrentProject());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID]);

  return (
    <Switch>
      {/* 只有当从团队进入的时候才有未加入的项目，才会显示项目预览 */}
      <Route path={`${path}/preview`}>
        {currentTeam && currentProjectSet && (
          <ProjectPreview
            team={currentTeam}
            projectSet={currentProjectSet}
            project={currentProject}
          />
        )}
      </Route>
      <Route path={`${path}/setting`}>
        <ProjectSetting project={currentProject} />
      </Route>
      <Route path={`${path}`}>
        <ProjectFiles project={currentProject} />
      </Route>
    </Switch>
  );
};
export default Project;
