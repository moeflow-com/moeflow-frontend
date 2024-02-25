import { css } from '@emotion/core';
import { FormItem, Icon, Tooltip } from '.';
import { Button, message, Modal, Tag } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Content, ContentItem, ContentTitle, TeamEditForm } from '.';
import api from '../apis';
import { TEAM_PERMISSION } from '../constants';
import { AppState } from '../store';
import {
  clearCurrentTeam,
  deleteTeam as deleteTeamActionCreator,
} from '../store/team/slice';
import style from '../style';
import { FC, UserTeam } from '../interfaces';
import { can } from '../utils/user';
import copy from 'copy-to-clipboard';
import { AvatarUpload } from './AvatarUpload';

/** 团队基础设置的属性接口 */
interface TeamSettingBaseProps {
  className?: string;
}
/**
 * 团队基础设置
 */
export const TeamSettingBase: FC<TeamSettingBaseProps> = ({ className }) => {
  const history = useHistory(); // 路由
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const currentTeam = useSelector(
    (state: AppState) => state.team.currentTeam,
  ) as UserTeam;
  const userID = useSelector((state: AppState) => state.user.id);
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';

  /** 解散团队 */
  const deleteTeam = () => {
    setDeleteLoading(true);
    api
      .deleteTeam({ id: currentTeam.id })
      .then((result) => {
        setDeleteLoading(false);
        // 删除成功
        dispatch(deleteTeamActionCreator({ id: currentTeam.id }));
        dispatch(clearCurrentTeam());
        // 跳转到主页
        history.replace(`/dashboard`);
        // 弹出提示
        message.success(result.data.message);
      })
      .catch((error) => {
        error.default();
        setDeleteLoading(false);
      });
  };

  /** 退出团队确认 */
  const showLeaveConfirm = () => {
    Modal.confirm({
      title: formatMessage({ id: 'team.leave' }),
      content: formatMessage({ id: 'team.leaveConfirm' }),
      onOk: () => {
        setLeaveLoading(true);
        api
          .deleteMember({
            groupType: 'team',
            groupID: currentTeam.id,
            userID,
          })
          .then((result) => {
            setLeaveLoading(false);
            dispatch(deleteTeamActionCreator({ id: currentTeam.id }));
            message.success(result.data.message);
            if (isMobile) {
              history.push('/dashboard/teams');
            } else {
              history.push('/dashboard');
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

  /** 解散团队确认 */
  const confirmDeleteTeam = () => {
    Modal.confirm({
      title: (
        <div>
          <Icon
            css={css`
              color: red;
              margin-right: 5px;
            `}
            icon="exclamation-triangle"
          />
          {formatMessage({ id: 'team.deleteTipTitle' })}
        </div>
      ),
      content: formatMessage(
        { id: 'team.deleteTip' },
        { team: currentTeam.name },
      ),
      okText: formatMessage({ id: 'team.delete' }),
      okType: 'danger',
      cancelText: formatMessage({ id: 'form.cancel' }),
      onOk() {
        deleteTeam();
      },
      onCancel() {},
    });
  };

  return (
    <div
      className={className}
      css={css`
        width: 100%;
        max-width: ${style.contentMaxWidth}px;
        padding: ${style.paddingBase}px;
        .TeamSettingBase__PermissionsToggleIcon {
          margin-left: 5px;
        }
      `}
    >
      <Content>
        <ContentTitle>{formatMessage({ id: 'team.me' })}</ContentTitle>
        <ContentItem>
          {formatMessage(
            { id: 'site.myRoleIs' },
            { role: currentTeam.role.name },
          )}
          <Button
            className="TeamSettingBase__PermissionsToggle"
            type="link"
            onClick={() => {
              setPermissionsVisible((x) => !x); // 显示/隐藏权限
            }}
          >
            {formatMessage({ id: 'site.permission' })}{' '}
            <Icon
              icon={permissionsVisible ? 'caret-up' : 'caret-down'}
              className="TeamSettingBase__PermissionsToggleIcon"
            />
          </Button>
        </ContentItem>
        {permissionsVisible && (
          <ContentItem>
            <div className="permissions">
              {currentTeam.role.permissions.map((x) => {
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
        <ContentItem>
          {currentTeam.role.systemCode !== 'creator' && (
            <Button block onClick={showLeaveConfirm} loading={leaveLoading}>
              {formatMessage({ id: 'team.leave' })}
            </Button>
          )}
        </ContentItem>
      </Content>
      <Content>
        <ContentTitle>{formatMessage({ id: 'team.info' })}</ContentTitle>
        <FormItem label={formatMessage({ id: 'team.id' })}>
          {currentTeam.id}{' '}
          <Button
            type="ghost"
            onClick={() => {
              const root =
                window.location.protocol + '//' + window.location.host;
              const url = root + `/dashboard/join/team/${currentTeam.id}`;
              copy(url);
            }}
          >
            {formatMessage({ id: 'group.copyJoinLink' })}
          </Button>
        </FormItem>
        <div style={{ marginBottom: '24px' }}>
          <AvatarUpload
            type="team"
            disabled={!can(currentTeam, TEAM_PERMISSION.CHANGE)}
          />
        </div>
        <ContentItem>
          <TeamEditForm />
        </ContentItem>
      </Content>
      {currentTeam.ocrQuotaMonth - currentTeam.ocrQuotaUsed > 0 && (
        <Content>
          <ContentTitle>
            {formatMessage({ id: 'site.aboutQuota' })}
          </ContentTitle>
          {/* <ContentItem>
          {formatMessage({ id: 'site.userCount' }) + formatMessage({ id: ':' })}
          {currentTeam.userCount}/{currentTeam.maxUser}
        </ContentItem> */}
          <ContentItem>
            {formatMessage({ id: 'site.ocrQuota' }) +
              formatMessage({ id: ':' })}
            {currentTeam.ocrQuotaMonth - currentTeam.ocrQuotaUsed}
            {' ' + formatMessage({ id: 'site.imageUnit' })}
          </ContentItem>
        </Content>
      )}
      <Content>
        {can(currentTeam, TEAM_PERMISSION.DELETE) && (
          <>
            <ContentTitle>
              {formatMessage({ id: 'site.dangerZone' })}
            </ContentTitle>
            <ContentItem>
              <Button block onClick={confirmDeleteTeam} loading={deleteLoading}>
                {formatMessage({ id: 'team.delete' })}
              </Button>
            </ContentItem>
          </>
        )}
      </Content>
    </div>
  );
};
