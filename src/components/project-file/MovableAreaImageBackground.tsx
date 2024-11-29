import { css } from '@emotion/core';
import React, { useRef } from 'react';
import { FC } from '@/interfaces';

/** 可移动区域图片背景的属性接口 */
interface MovableAreaImageBackgroundProps {
  src: string;
  onLoad?: (size: { width: number; height: number }) => any;
  className?: string;
}
/**
 * 可移动区域图片背景
 * @param onLoad 当图片onLoad时调用此函数，传递当时的size
 */
export const MovableAreaImageBackground: FC<
  MovableAreaImageBackgroundProps
> = ({ src, onLoad, className }) => {
  const domRef = useRef<HTMLImageElement>(null);
  return (
    <img
      className={className}
      css={css`
        user-select: none;
        /* 禁止 iOS 上 Safari/Chrome/Firefox，重按/长按图片弹出菜单 */
        -webkit-touch-callout: none;
        cursor: pointer;
        &:active {
          cursor: grabbing;
        }
      `}
      draggable={false} // 禁止浏览器拖拽图片
      onDragStart={(e) => e.preventDefault()} // 禁止 Firefox 拖拽图片（Firefox 仅 drageable={false} 无效）
      onContextMenu={(e) => e.preventDefault()} // 禁止鼠标右键菜单 和 Android 上 Chrome/Firefox，重按/长按图片弹出菜单
      ref={domRef}
      onLoad={(e) => {
        if (onLoad) {
          const size = {
            width: (domRef.current as HTMLImageElement).offsetWidth,
            height: (domRef.current as HTMLImageElement).offsetHeight,
          };
          onLoad(size);
        }
      }}
      src={src}
      alt=""
    />
  );
};
