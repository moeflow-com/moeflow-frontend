import { css } from '@emotion/core';
import { Button } from 'antd';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useClickAway } from 'react-use';
import { api } from '@/apis';
import { FC, File } from '@/interfaces';
import { AppState } from '@/store';
import style from '@/style';
import { toLowerCamelCase } from '@/utils';
import { clickEffect } from '@/utils/style';
import {
  useMoeflowCompanion,
  moeflowCompanionServiceState,
} from '@/services/moeflow_companion/use_moeflow_companion';

/** 图片文件选择下拉框的属性接口 */
interface ImageSelectProps {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}
/**
 * 图片文件选择下拉框
 * 这个组件需要有 state.project.currentProject
 */
export const ImageSelect: FC<ImageSelectProps> = ({
  value,
  onChange,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const domRef = useRef<HTMLDivElement>(null);
  const menuDomRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<File[]>();
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [index, setIndex] = useState('?');
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const limit = 100;
  const itemHeight = 40;

  const getImages = ({
    page,
    replace = false,
  }: {
    page: number;
    replace?: boolean;
  }) => {
    setLoading(true);
    if (!currentProject) return;
    api.file
      .getProjectFiles({
        projectID: currentProject.id,
        params: { page, limit },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        setTotal(Number(result.headers['x-pagination-count']));
        let newImages = data;
        if (images && !replace) {
          newImages = [...images, ...data];
        }
        setImages(newImages);
        const index = newImages.findIndex((image) => image.id === value);
        setIndex(index > -1 ? `${index + 1}` : '?');
        if (replace && index > -1) {
          menuDomRef.current?.scrollTo({ top: itemHeight * index });
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        error.default();
      });
  };

  const loadMore = () => {
    getImages({ page: page + 1 });
    setPage((page) => page + 1);
  };

  useEffect(() => {
    // TODO: 每次切换图片都会清空 images，导致超过 limit 时每次翻页页数都显示成 ?，需要加载更多才能显示出来
    // 希望可以可以不清空，仅从 url 进入时页数加载不全才显示 ？。
    // TODO 2: 手机版优化
    getImages({ page: 1, replace: true });
    // eslint-disable-next-line
  }, [currentProject?.id]);

  useClickAway(domRef, () => {
    setDropdownVisible(false);
  });

  return (
    <div
      className={classNames(['ImageSelect', className])}
      css={css`
        position: relative;
        .ImageSelect__Button {
          padding: 0 10px;
          line-height: 40px;
          ${clickEffect(
        css`
              background-color: ${style.widgetButtonHoverBackgroundColor};
            `,
        css`
              color: ${style.widgetButtonActiveColor};
            `,
      )};
        }
        .ImageSelect__MenuWrapper {
          opacity: 0;
          pointer-events: none;
          display: flex;
          position: absolute;
          top: 45px;
          right: -40px;
          border-radius: ${style.borderRadiusBase};
          max-width: ${isMobile ? '200px' : '300px'};
          max-height: ${isMobile ? '200px' : '300px'};
          overflow: hidden;
          box-shadow: ${style.boxShadowBase};
        }
        .ImageSelect__MenuWrapper--active {
          opacity: 1;
          pointer-events: auto;
        }
        .ImageSelect__Menu {
          width: 100%;
          flex-direction: column;
          background-color: rgba(255, 255, 255, 0.9);
          overflow-x: hidden;
          overflow-y: auto;
        }
        .ImageSelect__MenuItem {
          padding: 0 15px;
          height: ${itemHeight}px;
          line-height: ${itemHeight}px;
          width: 100%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          ${clickEffect(
        css`
              background-color: ${style.widgetButtonHoverBackgroundColor};
            `,
        css`
              color: ${style.widgetButtonActiveColor};
            `,
      )};
        }
        .ImageSelect__MenuItem--active {
          background-color: ${style.widgetButtonActiveBackgroundColor};
        }
        .ImageSelect__MenuLoadMoreButton {
          padding: 0 15px;
          height: ${itemHeight}px;
          line-height: ${itemHeight}px;
          transition: none;
          border-radius: 0;
          border-width: 0;
          ${clickEffect(
        css`
              background-color: ${style.widgetButtonHoverBackgroundColor};
            `,
        css`
              color: ${style.widgetButtonActiveColor};
            `,
      )};
        }
      `}
      ref={domRef}
    >
      {images && (
        <div
          className="ImageSelect__Button"
          onClick={() => {
            setDropdownVisible((b) => !b);
          }}
        >
          {index}/{total}
        </div>
      )}
      {images && (
        <div
          className={classNames('ImageSelect__MenuWrapper', {
            'ImageSelect__MenuWrapper--active': dropdownVisible,
          })}
        >
          <div className="ImageSelect__Menu" ref={menuDomRef}>
            {images.map((image, index) => (
              <div
                className={classNames('ImageSelect__MenuItem', {
                  'ImageSelect__MenuItem--active': image.id === value,
                })}
                key={image.id}
                onClick={() => {
                  onChange?.(image.id);
                }}
              >
                [{index + 1}] {image.name}
              </div>
            ))}
            {images.length < total && (
              <Button
                className="ImageSelect__MenuLoadMoreButton"
                type="text"
                loading={loading}
                block={true}
                onClick={(e) => {
                  e.stopPropagation();
                  loadMore();
                }}
              >
                {formatMessage({ id: 'site.loadMore' })}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
