import { css } from '@emotion/core';
import { message, Spin } from 'antd';
import { useEffect, useState, cloneElement } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { FileList, Icon, ListItem } from '@/components';
import { IMPORT_FROM_LABELPLUS_STATUS, PROJECT_STATUS } from '@/constants';
import { useTitle } from '@/hooks';
import { FC, Project, Target } from '@/interfaces';
import { AppState } from '@/store';
import style from '../style';
import {
  clearDefaultTargetID,
  loadDefaultTargetID,
  saveDefaultTargetID,
} from '@/utils/storage';
import { ProjectFinishedTip } from '@/components/project/ProjectFinishedTip';
import { ProjectTargetList } from '@/components/project/ProjectTargetList';
import { ProjectImportFromLabelplusStatus } from '@/components/project/ProjectImportFromLabelplusStatus';

/** 项目文件页的属性接口 */
interface ProjectFilesProps {
  project?: Project;
}
/**
 * 项目文件页
 */
const ProjectFiles: FC<ProjectFilesProps> = ({ project }) => {
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const [targets, setTargets] = useState<Target[]>([]);
  const [currentTarget, setCurrentTarget] = useState<Target>();

  // 设置当前目标 project
  useEffect(() => {
    setCurrentTarget(undefined);
    setTargets([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  // 项目已完结返回提示
  if (project?.status === PROJECT_STATUS.FINISHED) {
    return <ProjectFinishedTip />;
  }

  if (!project) {
    return (
      <div>
        <Spin
          size="large"
          css={css`
            flex: auto;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        />
      </div>
    );
  }

  const wrapper =
    <div
      css={css`
        width: 100%;
        height: 100%;
        flex: auto;
        display: flex;
        flex-direction: column;
        .Project__ListItemTitle {
          width: 100%;
          flex: none;
          font-size: 13px;
          .ListItem__Logo {
            color: ${style.primaryColor};
          }
          .ListItem__Name {
            color: ${style.primaryColor};
            font-weight: bold;
          }
        }
      `}
    />;

  if (!currentTarget) {
    // target selector
    return cloneElement(wrapper, undefined,
      targets && (
        <ListItem
          disabled={true}
          className="Project__ListItemTitle"
          logo={
            !isMobile && (
              <Icon
                className="ListItem__LogoBoxIcon"
                icon="language"
                style={{ height: '28px', width: '28px' }}
              ></Icon>
            )
          }
          name={formatMessage({ id: 'project.selectTarget' })}
        />
      ),
      <ProjectTargetList
        project={project}
        onClick={(target) => {
          setCurrentTarget(target);
          saveDefaultTargetID({
            projectID: project.id,
            targetID: target.id,
          });
        }}
        onLoad={(targets) => {
          setTargets(targets);
          // 只有一个时候，直接选中
          if (targets.length === 1) {
            setCurrentTarget(targets[0]);
          }
          // 自动选中默认的
          const defaultTargetID = loadDefaultTargetID({
            projectID: project.id,
          });
          if (defaultTargetID) {
            const target = targets.find(
              (target) => target.id === defaultTargetID,
            );
            if (target) {
              setCurrentTarget(target);
            }
          }
        }}
      />
    )
  }

  if (project.importFromLabelplusStatus !== IMPORT_FROM_LABELPLUS_STATUS.SUCCEEDED) {
    return cloneElement(wrapper, undefined, <ProjectImportFromLabelplusStatus project={project} />)
  }

  return cloneElement(wrapper, undefined,
    <FileList
      project={project}
      target={currentTarget}
      onChangeTargetClick={() => {
        if (targets.length > 1) {
          setCurrentTarget(undefined);
          clearDefaultTargetID({ projectID: project.id });
        } else {
          message.info(
            formatMessage({ id: 'project.onlyOneTargetTip' }),
            1,
          );
        }
      }}
    />
  )
};
export default ProjectFiles;
