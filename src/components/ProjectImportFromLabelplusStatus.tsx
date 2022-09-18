import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { FC, Project } from '../interfaces';
import classNames from 'classnames';
import { IMPORT_FROM_LABELPLUS_STATUS } from '../constants';
import { useInterval } from 'react-use';
import apis from '../apis';
import { toLowerCamelCase } from '../utils';
import { useDispatch } from 'react-redux';
import { editProject, setCurrentProject } from '../store/project/slice';
import { Progress, Result } from 'antd';

/** 导入进度的属性接口 */
interface ProjectImportFromLabelplusStatusProps {
  project: Project;
  className?: string;
}
/**
 * 导入进度
 */
export const ProjectImportFromLabelplusStatus: FC<ProjectImportFromLabelplusStatusProps> = ({
  project,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const delay =
    project.importFromLabelplusStatus ===
      IMPORT_FROM_LABELPLUS_STATUS.RUNNING ||
    project.importFromLabelplusStatus === IMPORT_FROM_LABELPLUS_STATUS.PENDING
      ? 5000
      : null;

  useInterval(() => {
    apis.getProject({ id: project.id }).then((result) => {
      const data = toLowerCamelCase(result.data);
      dispatch(setCurrentProject(data));
      dispatch(editProject(data));
    });
  }, delay);

  return (
    <div
      className={classNames(['ProjectImportFromLabelplusStatus', className])}
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      {project.importFromLabelplusStatus ===
        IMPORT_FROM_LABELPLUS_STATUS.PENDING && (
        <Result
          title={formatMessage({
            id: 'projectImportFromLabelplusStatus.pending',
          })}
        />
      )}
      {project.importFromLabelplusStatus ===
        IMPORT_FROM_LABELPLUS_STATUS.ERROR && (
        <Result
          status="warning"
          title={project.importFromLabelplusErrorTypeName}
        />
      )}
      {project.importFromLabelplusStatus ===
        IMPORT_FROM_LABELPLUS_STATUS.RUNNING && (
        <Result
          title={formatMessage({
            id: 'projectImportFromLabelplusStatus.running',
          })}
          extra={
            <Progress
              percent={project.importFromLabelplusPercent}
              status="active"
            />
          }
        />
      )}
    </div>
  );
};
