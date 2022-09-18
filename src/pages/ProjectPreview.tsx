import { css } from '@emotion/core';
import { Button, Input, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import apis from '../apis';
import { Spin } from '../components';
import { IMAGE_COVER, PROJECT_ALLOW_APPLY_TYPE } from '../constants';
import { useTitle } from '../hooks';
import { FC, File, Project, ProjectSet, Team } from '../interfaces';
import { AppState } from '../store';
import { editProject, setCurrentProject } from '../store/project/slice';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { cardActiveEffect, cardClickEffect, clickEffect } from '../utils/style';

/** 团队设置页的属性接口 */
interface ProjectPreviewProps {
  team: Team;
  projectSet: ProjectSet;
  project?: Project;
}
/**
 * 团队设置页
 */
const ProjectPreview: FC<ProjectPreviewProps> = ({
  team,
  projectSet,
  project,
}) => {
  useTitle(); // 设置标题
  const { formatMessage } = useIntl();
  const history = useHistory();
  const dispatch = useDispatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const { projectID } = useParams<{ projectID: string }>();
  const isMobile = platform === 'mobile';
  const coverWidth = isMobile ? IMAGE_COVER.WIDTH / 2 : IMAGE_COVER.WIDTH;
  const coverHeight = isMobile ? IMAGE_COVER.HEIGHT / 2 : IMAGE_COVER.HEIGHT;
  const previewListHeight = coverHeight + 40;
  const joinFormHeight = 100;
  const [items, setItems] = useState<File[]>();
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const currentPageRef = useRef(1);
  const [currentImage, setCurrentImage] = useState<File>();
  const [applying, setApplying] = useState(false);
  const [reason, setReason] = useState('');

  // 设置当前目标 project
  useEffect(() => {
    getFiles({ page: 1 });
    return () => {
      setItems(undefined);
      setLoading(true);
      setHasMore(true);
      setCurrentImage(undefined);
      currentPageRef.current = 1;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID]);

  const getFiles = ({ page }: { page: number }) => {
    setLoading(true);
    apis
      .getProjectFiles({
        projectID,
        params: {
          page,
          limit: 10,
        },
      })
      .then((result) => {
        const data = (result.data as File[]).map((d) => toLowerCamelCase(d));
        if (page === 1 && data.length > 0) {
          setCurrentImage(data[0]);
        }
        setItems((items) => {
          const oldItems = items === undefined ? [] : items;
          const newItems = [...oldItems, ...data];
          if (
            newItems.length === parseInt(result.headers['x-pagination-count'])
          ) {
            setHasMore(false);
          }
          return newItems;
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        error.default();
      });
  };

  const handleApply = () => {
    setApplying(true);
    apis
      .createApplication({
        groupType: 'project',
        groupID: project!.id,
        data: {
          message: reason,
        },
      })
      .then((result) => {
        setApplying(false);
        setReason('');
        const data = toLowerCamelCase(result.data);
        // 弹出提示
        message.success(data.message);
        // 无需审核或先前有邀请，则跳转到所在项目
        if (data.group && data.group.role) {
          // 加入成功
          dispatch(setCurrentProject(data.group));
          dispatch(editProject(data.group));
          // 跳转到项目
          history.replace(
            `/dashboard/teams/${team.id}/project-sets/${projectSet.id}/projects/${data.group.id}`
          );
        }
      })
      .catch((error) => {
        setApplying(false);
        error.default();
      });
  };

  return project && items !== undefined ? (
    <div
      className={classNames('ProjectPreview', {
        'ProjectPreview--empty': items.length === 0,
      })}
      css={css`
        height: 100%;
        width: 100%;
        &.ProjectPreview--empty {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .ProjectPreview__EmptyTip {
          font-size: 20px;
          margin-bottom: 10px;
          color: ${style.textColorSecondary};
        }
        .ProjectPreview__PreviewImageWrapper {
          width: 100%;
          height: calc(100% - ${previewListHeight + joinFormHeight}px);
        }
        .ProjectPreview__JoinWrapper {
          height: ${joinFormHeight}px;
          padding-top: 15px;
        }
        .ProjectPreview__Join {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          border: 1px solid ${style.borderColorBase};
          border-radius: ${style.borderRadiusBase};
          margin: 0 15px;
          padding: 0 15px;
          text-align: center;
        }
        .ProjectPreview__JoinTitle {
          font-size: 16px;
          font-weight: bold;
        }
        .ProjectPreview__JoinTip {
          display: flex;
          align-items: center;
          min-height: 32px;
        }
        .ProjectPreview__JoinForm {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 3px;
        }
        .ProjectPreview__JoinFormReasonInput {
          max-width: 300px;
          margin-right: 10px;
        }
        .ProjectPreview__JoinFormSubmitButton {
        }
        .ProjectPreview__PreviewImage {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ProjectPreview__PreviewListWrapper {
          flex: none;
          width: 100%;
          overflow-x: scroll;
          overflow-y: hidden;
          height: ${previewListHeight}px;
        }
        .ProjectPreview__PreviewList {
          display: flex;
          height: 100%;
          margin: 0 15px;
          align-items: center;
        }
        .ProjectPreview__PreviewListImageWrapper {
          flex: none;
          margin-right: 15px;
          width: ${coverWidth}px;
          height: ${coverHeight}px;
          overflow: hidden;
          border-radius: ${style.borderRadiusBase};
          transition: box-shadow 100ms, border-color 100ms;
          border: 1px solid ${style.borderColorLight};
          .ProjectPreview__PreviewListImage {
            width: ${coverWidth}px;
            height: ${coverHeight}px;
            overflow: hidden;
            transition: transform 400ms;
            user-select: none;
            /* 禁止 iOS 上 Safari/Chrome/Firefox，重按/长按图片弹出菜单 */
            -webkit-touch-callout: none;
          }
          ${cardClickEffect()};
          ${clickEffect(
            css`
              .ProjectPreview__PreviewListImage {
                transform: scale(1.1);
              }
            `,
            css`
              .ProjectPreview__PreviewListImage {
                transform: scale(1.08);
                transition: transform 100ms;
              }
            `
          )};
        }
        .ProjectPreview__PreviewListImageWrapper--active {
          ${cardActiveEffect()};
          .ProjectPreview__PreviewListImage {
            transform: scale(1.08);
          }
        }
      `}
    >
      {items.length === 0 && (
        <div className="ProjectPreview__EmptyTip">
          {formatMessage({ id: 'projectPreview.empty' })}
        </div>
      )}
      {items.length > 0 && (
        <div className="ProjectPreview__PreviewImageWrapper">
          {currentImage && (
            <img
              className="ProjectPreview__PreviewImage"
              src={currentImage.url}
              alt={currentImage.name}
              draggable={false} // 禁止浏览器拖拽图片
              onDragStart={(e) => e.preventDefault()} // 禁止 Firefox 拖拽图片（Firefox 仅 drageable={false} 无效）
              onContextMenu={(e) => e.preventDefault()} // 禁止鼠标右键菜单 和 Android 上 Chrome/Firefox，重按/长按图片弹出菜单
            />
          )}
        </div>
      )}
      <div className="ProjectPreview__JoinWrapper">
        <div className="ProjectPreview__Join">
          {project.allowApplyType === PROJECT_ALLOW_APPLY_TYPE.NONE ? (
            <>
              <div className="ProjectPreview__JoinTitle">
                {formatMessage({ id: 'project.notAllowApplyTipTitle' })}
              </div>
              <div className="ProjectPreview__JoinTip">
                {formatMessage(
                  { id: 'project.notAllowApplyTip' },
                  { project: project.name }
                )}
              </div>
            </>
          ) : project.isNeedCheckApplication ? (
            <>
              <div className="ProjectPreview__JoinTitle">
                {formatMessage(
                  { id: 'application.reasonLabel' },
                  { name: project.name }
                )}
              </div>
              <div className="ProjectPreview__JoinForm">
                <Input
                  className="ProjectPreview__JoinFormReasonInput"
                  placeholder={formatMessage({ id: 'application.reason' })}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                  }}
                />
                <Button
                  className="ProjectPreview__JoinFormSubmitButton"
                  loading={applying}
                  type="primary"
                  onClick={handleApply}
                >
                  {formatMessage({ id: 'site.apply' })}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="ProjectPreview__JoinTitle">
                {formatMessage(
                  { id: 'project.applyConfirm' },
                  { project: project.name }
                )}
              </div>
              <div className="ProjectPreview__JoinForm">
                <Button
                  className="ProjectPreview__JoinFormSubmitButton"
                  loading={applying}
                  type="primary"
                  onClick={handleApply}
                >
                  {formatMessage({ id: 'site.join' })}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {items.length > 0 && (
        <div className="ProjectPreview__PreviewListWrapper">
          <div className="ProjectPreview__PreviewList">
            {items.map((item) => (
              <div
                className={classNames(
                  'ProjectPreview__PreviewListImageWrapper',
                  {
                    'ProjectPreview__PreviewListImageWrapper--active':
                      item.id === currentImage?.id,
                  }
                )}
                key={item.id}
                onClick={() => {
                  setCurrentImage(undefined);
                  setTimeout(() => {
                    setCurrentImage(item);
                  });
                }}
              >
                <img
                  className="ProjectPreview__PreviewListImage"
                  src={item.coverUrl}
                  alt={item.name}
                  draggable={false} // 禁止浏览器拖拽图片
                  onDragStart={(e) => e.preventDefault()} // 禁止 Firefox 拖拽图片（Firefox 仅 drageable={false} 无效）
                  onContextMenu={(e) => e.preventDefault()} // 禁止鼠标右键菜单 和 Android 上 Chrome/Firefox，重按/长按图片弹出菜单
                />
              </div>
            ))}
            {hasMore && (
              <Button
                className="ProjectPreview__More"
                loading={loading}
                onClick={() => {
                  currentPageRef.current++;
                  getFiles({ page: currentPageRef.current });
                }}
              >
                {formatMessage({ id: 'site.loadMore' })}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <Spin
      size="large"
      css={css`
        flex: auto;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    />
  );
};
export default ProjectPreview;
