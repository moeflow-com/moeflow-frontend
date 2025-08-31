import { css } from '@emotion/core';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Icon, TranslationProgress } from '@/components';
import { PROJECT_PERMISSION, PROJECT_STATUS } from '@/constants';
import { FC, Project } from '@/interfaces';
import { resetFilesState } from '@/store/file/slice';
import style from '@/style';
import { cardActiveEffect, cardClickEffect, clickEffect } from '@/utils/style';
import { can } from '@/utils/user';

/** 项目列表元素的属性接口 */
interface ProjectItemProps {
  from: 'team' | 'user';
  project: Project | Project;
  className?: string;
}
/**
 * 项目列表元素
 */
export const ProjectItem: FC<ProjectItemProps> = ({
  from,
  project,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const { url } = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  // 点击后跳转路径前缀
  let urlPrefix = '';
  if (from === 'team') {
    urlPrefix = '/projects';
  }

  const handleClick = () => {
    dispatch(resetFilesState());
    if (project.status === PROJECT_STATUS.FINISHED) {
      history.push(`${url + urlPrefix}/${project.id}/setting`);
    } else {
      if (can(project, PROJECT_PERMISSION.ACCESS)) {
        history.push(`${url + urlPrefix}/${project.id}`);
      } else {
        history.push(`${url + urlPrefix}/${project.id}/preview`);
      }
    }
  };

  const handleSettingClick = () => {
    history.push(`${url + urlPrefix}/${project.id}/setting`);
  };

  return (
    <div
      className={classNames('ProjectItem', className, {
        'ProjectItem--hasBelong': from === 'user',
        'ProjectItem--active': location.pathname.includes(
          'projects/' + project.id,
        ),
      })}
      css={css`
        width: 100%;
        border-radius: ${style.borderRadiusBase};
        overflow: hidden;
        transition:
          box-shadow 100ms,
          border-color 100ms;
        border: 1px solid ${style.borderColorLight};
        padding: 3px ${style.paddingBase - 5}px 0;
        &.ProjectItem--hasBelong {
          padding-top: ${style.paddingBase - 3}px;
        }
        &.ProjectItem--active {
          ${cardActiveEffect()};
        }
        .ProjectItem__Belong {
          width: 100%;
          display: flex;
          align-items: center;
          font-size: 12px;
          line-height: 12px;
          color: ${style.textColorSecondary};
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ProjectItem__TeamName {
          flex: none;
          max-width: 31%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ProjectItem__TeamToProjectSetIcon {
          flex: none;
          margin: 0 4px;
        }
        .ProjectItem__ProjectSetName {
          flex: none;
          max-width: calc(69% - 14px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ProjectItem__Name {
          max-height: 60px;
          overflow: hidden;
          word-break: break-all;
          font-size: 14px;
          line-height: 20px;
          box-sizing: content-box;
          margin: 5px 0;
        }
        .ProjectItem__Bottom {
          display: flex;
          align-items: center;
          height: 32px;
        }
        .ProjectItem__BottomButtonWrapper {
          margin-left: auto;
          font-size: 12px;
          display: flex;
          align-items: center;
          color: ${style.textColorSecondaryLighter};
        }
        .ProjectItem__BottomButtonSetting {
          flex: none;
          border-radius: ${style.borderRadiusBase};
          padding: 5px 9px;
          margin-right: -8px;
          ${clickEffect()};
        }
        .ProjectItem__BottomButtonIcon {
          margin-right: 3px;
        }
        .ProjectItem__BottomButtonFinished {
          .ProjectItem__BottomButtonIcon {
            margin-right: 0;
          }
        }
        ${cardClickEffect()};
      `}
      onClick={handleClick}
    >
      {from === 'user' && (
        <div className="ProjectItem__Belong">
          <div className="ProjectItem__TeamName">{project.team.name}</div>
          <Icon
            className="ProjectItem__TeamToProjectSetIcon"
            icon="angle-right"
          />
          <div className="ProjectItem__ProjectSetName">
            {project.projectSet.default
              ? formatMessage({ id: 'projectSet.default' })
              : project.projectSet.name}
          </div>
        </div>
      )}
      <div className="ProjectItem__Name">{project.name}</div>
      <TranslationProgress
        className="ProjectItem__TranslationProgressLine"
        sourceCount={project.sourceCount * project.targetCount}
        translatedSourceCount={project.translatedSourceCount}
        checkedSourceCount={project.checkedSourceCount}
        type="line"
      />
      <div className="ProjectItem__Bottom">
        <TranslationProgress
          className="ProjectItem__TranslationProgressText"
          sourceCount={project.sourceCount * project.targetCount}
          translatedSourceCount={project.translatedSourceCount}
          checkedSourceCount={project.checkedSourceCount}
          type="text"
        />
        <div className="ProjectItem__BottomButtonWrapper">
          {project.status === PROJECT_STATUS.FINISHED ? (
            <div className="ProjectItem__BottomButton ProjectItem__BottomButtonFinished">
              <Icon
                className="ProjectItem__BottomButtonIcon"
                icon={['far', 'kiss-wink-heart']}
              />{' '}
              {formatMessage({ id: 'project.finished' })}
            </div>
          ) : can(project, PROJECT_PERMISSION.ACCESS) ? (
            <div
              className="ProjectItem__BottomButton ProjectItem__BottomButtonSetting"
              onClick={(e) => {
                e.stopPropagation();
                handleSettingClick();
              }}
            >
              <Icon className="ProjectItem__BottomButtonIcon" icon="cog" />
              {formatMessage({ id: 'site.setting' })}
            </div>
          ) : (
            <div className="ProjectItem__BottomButton">
              <Icon className="ProjectItem__BottomButtonIcon" icon="plus" />
              {formatMessage({ id: 'site.join' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
