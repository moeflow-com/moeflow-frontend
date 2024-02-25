import { css } from '@emotion/core';
import { Button, message, Modal, Tag } from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Content,
  ContentItem,
  ContentTitle,
  FormItem,
  Icon,
  ProjectEditForm,
  Tooltip,
} from '.';
import api from '../apis';
import {
  PROJECT_PERMISSION,
  PROJECT_STATUS,
  TEAM_PERMISSION,
} from '../constants';
import { FC, Project } from '../interfaces';
import { AppState } from '../store';
import {
  deleteProject,
  editProject,
  setCurrentProject,
} from '../store/project/slice';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { can } from '../utils/user';

/** 项目基础设置的属性接口 */
interface ProjectSettingBaseProps {
  className?: string;
}
/**
 * 项目基础设置
 */
export const ProjectSettingBase: FC<ProjectSettingBaseProps> = ({
  className,
}) => {
  const history = useHistory(); // 路由
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [adminJoining, setAdminJoining] = useState(false);
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet,
  );
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  ) as Project;
  const userID = useSelector((state: AppState) => state.user.id);
  const [permissionsVisible, setPermissionsVisible] = useState(false);

  /** 完结项目 */
  const finishProject = () => {
    setDeleteLoading(true);
    api
      .finishProject({ id: currentProject.id })
      .then((result) => {
        setDeleteLoading(false);
        const finishedProject = {
          ...currentProject,
          status: PROJECT_STATUS.FINISHED,
        };
        dispatch(deleteProject(finishedProject));
        dispatch(setCurrentProject(finishedProject));
        // 弹出提示
        message.success(result.data.message);
      })
      .catch((error) => {
        error.default();
        setDeleteLoading(false);
      });
  };

  /** 退出项目确认 */
  const showLeaveConfirm = () => {
    Modal.confirm({
      title: formatMessage({ id: 'project.leave' }),
      content: formatMessage({ id: 'project.leaveConfirm' }),
      onOk: () => {
        setLeaveLoading(true);
        api
          .deleteMember({
            groupType: 'project',
            groupID: currentProject.id,
            userID,
          })
          .then((result) => {
            setLeaveLoading(false);
            const data = toLowerCamelCase(result.data);
            dispatch(editProject(data.group));
            // 弹出提示
            message.success(result.data.message);
            if (currentTeam && currentProjectSet) {
              if (
                !can(currentTeam, TEAM_PERMISSION.AUTO_BECOME_PROJECT_ADMIN)
              ) {
                history.replace(
                  `/dashboard/teams/${currentTeam.id}/project-sets/${currentProjectSet.id}`,
                );
              } else {
                dispatch(setCurrentProject(data.group));
              }
            } else {
              dispatch(deleteProject({ id: data.group.id }));
              history.replace(`/dashboard/projects`);
            }
          })
          .catch((error) => {
            setLeaveLoading(false);
            error.default();
          });
      },
      onCancel: () => {},
      okText: formatMessage({ id: 'form.ok' }),
      cancelText: formatMessage({ id: 'form.cancel' }),
    });
  };

  /** 完结项目确认 */
  const confirmFinishProject = () => {
    Modal.confirm({
      title: <div>{formatMessage({ id: 'project.finishTipTitle' })}</div>,
      content: formatMessage(
        { id: 'project.finishTip' },
        { project: currentProject.name },
      ),
      okText: formatMessage({ id: 'project.finish' }),
      cancelText: formatMessage({ id: 'form.cancel' }),
      onOk() {
        finishProject();
      },
      onCancel() {},
    });
  };

  /** 团队管理员直接加入项目成为项目管理员 */
  const adminNewProject = () => {
    setAdminJoining(true);
    api
      .createApplication({
        groupType: 'project',
        groupID: currentProject.id,
        data: {
          message: '',
        },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        // 加入成功
        dispatch(editProject(data.group));
        dispatch(setCurrentProject(data.group));
        // 弹出提示
        message.success(data.message);
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setAdminJoining(false);
      });
  };

  return (
    <div
      className={classNames('ProjectSettingBase', className)}
      css={css`
        width: 100%;
        max-width: ${style.contentMaxWidth}px;
        padding: ${style.paddingBase}px;
        .ProjectSettingBase__PermissionsToggleIcon {
          margin-left: 5px;
        }
      `}
    >
      <Content>
        <ContentTitle>{formatMessage({ id: 'project.me' })}</ContentTitle>
        <ContentItem>
          {formatMessage(
            { id: 'site.myRoleIs' },
            { role: currentProject.role.name },
          )}
          {currentProject.autoBecomeProjectAdmin &&
            formatMessage({ id: 'project.autoBecomeProjectAdmin' })}
          <Button
            className="ProjectSettingBase__PermissionsToggle"
            type="link"
            onClick={() => {
              setPermissionsVisible((x) => !x); // 显示/隐藏权限
            }}
          >
            {formatMessage({ id: 'site.permission' })}{' '}
            <Icon
              icon={permissionsVisible ? 'caret-up' : 'caret-down'}
              className="ProjectSettingBase__PermissionsToggleIcon"
            />
          </Button>
        </ContentItem>
        {permissionsVisible && (
          <ContentItem>
            <div className="permissions">
              {currentProject.role.permissions.map((x) => {
                return (
                  <Tooltip
                    overlayClassName="permission-tag-tooltip"
                    title={x.intro}
                    key={x.id}
                  >
                    <Tag>{x.name}</Tag>
                  </Tooltip>
                );
              })}
            </div>
          </ContentItem>
        )}
        {currentProject.autoBecomeProjectAdmin && (
          <ContentItem>
            <Button block onClick={adminNewProject} loading={adminJoining}>
              {formatMessage({ id: 'project.join' })}
            </Button>
          </ContentItem>
        )}
        {currentProject.role.systemCode !== 'creator' &&
          !currentProject.autoBecomeProjectAdmin && (
            <ContentItem>
              <Button block onClick={showLeaveConfirm} loading={leaveLoading}>
                {formatMessage({ id: 'project.leave' })}
              </Button>
            </ContentItem>
          )}
      </Content>
      <Content>
        <ContentTitle>{formatMessage({ id: 'project.info' })}</ContentTitle>
        <FormItem label={formatMessage({ id: 'project.id' })}>
          {currentProject.id}{' '}
          <Button
            type="ghost"
            onClick={() => {
              const root =
                window.location.protocol + '//' + window.location.host;
              const url = root + `/dashboard/join/project/${currentProject.id}`;
              copy(url);
            }}
          >
            {formatMessage({ id: 'group.copyJoinLink' })}
          </Button>
        </FormItem>
        <ContentItem>
          <ProjectEditForm />
        </ContentItem>
      </Content>
      {/* <Content>
        <ContentTitle>{formatMessage({ id: 'site.aboutQuota' })}</ContentTitle>
        <ContentItem>
          {formatMessage({ id: 'site.userCount' })+ formatMessage({ id: ':' })}
          {currentProject.userCount}/{currentProject.maxUser}
        </ContentItem>
      </Content> */}
      <Content>
        {(can(currentProject, PROJECT_PERMISSION.FINISH) ||
          can(currentProject, PROJECT_PERMISSION.DELETE)) && (
          <ContentTitle>
            {formatMessage({ id: 'site.dangerZone' })}
          </ContentTitle>
        )}
        {can(currentProject, PROJECT_PERMISSION.FINISH) && (
          <ContentItem>
            <Button
              block
              onClick={confirmFinishProject}
              loading={deleteLoading}
            >
              {formatMessage({ id: 'project.finish' })}
            </Button>
          </ContentItem>
        )}
      </Content>
    </div>
  );
};
