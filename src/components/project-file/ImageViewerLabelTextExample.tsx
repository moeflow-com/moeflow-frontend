import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { Direction, FC, WritingMode } from '@/interfaces';

/** 标记相对文本位置示例的属性接口 */
interface ImageViewerLabelTextExampleProps {
  visible?: boolean;
  direction: Direction;
  writingMode: WritingMode;
  originDirection: Direction;
  originWritingMode: WritingMode;
  className?: string;
}
/**
 * 标记相对文本位置示例
 * @param visible 是否可见
 * @param direction 目标语言的方向
 * @param writingMode 目标语言的书写模式
 * @param originDirection 源标语言的方向
 * @param originWritingMode 源语言的书写模式
 */
export const ImageViewerLabelTextExample: FC<
  ImageViewerLabelTextExampleProps
> = ({
  visible = true,
  direction,
  writingMode,
  originDirection,
  originWritingMode,
  className,
}) => {
  const lineHeight = 30; // 垂直状态下 line 的高度和宽度
  const lineWidth = 5;
  const lineMargin = 4; // line 的间距
  const lastLineScale = 0.4; // 最后一个 line 的 高度/宽度 缩放值
  return (
    <div
      className={className}
      css={css`
        width: 0;
        height: 0;
        .lines {
          position: absolute;
          display: flex;
          transition: opacity 200ms;
          padding: 3px;
          border: 1px dotted #333;
          .line {
            flex: none;
            background: #333;
            border-radius: 1.5px;
          }
          /* 水平方向，width 和 height 需要互换 */
          &.origin-horizontal-tb {
            flex-direction: column;
            .line {
              height: ${lineWidth}px;
              width: ${lineHeight}px;
              margin-bottom: ${lineMargin}px;
              &:last-child {
                width: ${lineHeight * lastLineScale}px;
                margin-bottom: 0;
              }
            }
            &.origin-ltr {
              align-items: flex-start;
            }
            &.origin-rtl {
              align-items: flex-end;
            }
          }
          /* 垂直方向 */
          &.origin-vertical-rl,
          &.origin-vertical-lr {
            flex-direction: row;
            .line {
              height: ${lineHeight}px;
              width: ${lineWidth}px;
              margin-right: ${lineMargin}px;
              &:last-child {
                margin-right: 0;
              }
            }
          }
          &.origin-vertical-rl {
            .line {
              &:first-of-type {
                height: ${lineHeight * lastLineScale}px;
              }
            }
          }
          &.origin-vertical-lr {
            .line {
              &:last-child {
                height: ${lineHeight * lastLineScale}px;
              }
            }
          }
          /* 目标语言箭头偏移位置 */
          /* 水平方向 */
          &.horizontal-tb {
            &.ltr {
              left: 5px;
              top: -${lineWidth / 2 + 4}px;
            }
            &.rtl {
              right: 5px;
              top: -${lineWidth / 2 + 4}px;
            }
          }
          /* 垂直方向 */
          &.vertical-rl {
            top: 5px;
            right: -${lineWidth / 2 + 4}px;
          }
          &.vertical-lr {
            top: 5px;
            left: -${lineWidth / 2 + 4}px;
          }
        }
      `}
    >
      <div
        style={{
          opacity: visible ? 0.28 : 0,
        }}
        className={classNames([
          'lines',
          direction,
          writingMode,
          'origin-' + originDirection,
          'origin-' + originWritingMode,
        ])}
      >
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </div>
  );
};
