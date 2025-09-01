import { css } from '@emotion/core';
import classNames from 'classnames';
import { FC, File } from '../../interfaces';
import style from '../../style';

/** 文件封面的属性接口 */
interface FileCoverProps {
  file: File;
  onClick: () => void;
  coverWidth: number;
  coverHeight: number;
  className?: string;
}
/**
 * 文件封面
 */
export const FileCover: FC<FileCoverProps> = ({
  file,
  onClick,
  coverWidth,
  coverHeight,
  className,
}) => {
  return (
    <div
      className={classNames(['FileCover', className])}
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 15px 0 5px;
        height: ${coverHeight}px;
        .FileCover__CoverImage {
          width: ${coverWidth}px;
          height: ${coverHeight}px;
          background-color: #fafafa;
          border: 1px solid ${style.borderColorLight};
          cursor: pointer;
          user-select: none;
          /* 禁止 iOS 上 Safari/Chrome/Firefox，重按/长按图片弹出菜单 */
          -webkit-touch-callout: none;
        }
      `}
    >
      <img
        className="FileCover__CoverImage"
        draggable={false} // 禁止浏览器拖拽图片
        onDragStart={(e) => e.preventDefault()} // 禁止 Firefox 拖拽图片（Firefox 仅 drageable={false} 无效）
        onContextMenu={(e) => e.preventDefault()} // 禁止鼠标右键菜单 和 Android 上 Chrome/Firefox，重按/长按图片弹出菜单
        src={file.coverUrl}
        onClick={onClick}
        alt={file.name}
      />
    </div>
  );
};
