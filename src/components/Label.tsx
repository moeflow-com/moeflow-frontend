import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store';
import style from '../style';
import {
  Direction,
  FC,
  labelSavingStatuses,
  LabelStatus,
  WritingMode,
} from '../interfaces';
import { Spin } from './Spin';
import { SOURCE_POSITION_TYPE } from '../constants/source';
import { useIntl } from 'react-intl';

/** 标签的属性接口 */
export interface LabelProps {
  index: number;
  id: string;
  status?: LabelStatus;
  positionType?: number;
  allowMove?: boolean;
  active?: boolean;
  focus?: boolean;
  scale?: number;
  content?: string;
  styleTransition?: string;
  direction?: Direction;
  writingMode?: WritingMode;
  originDirection?: Direction;
  originWritingMode?: WritingMode;
  className?: string;
}
/**
 * 标签
 * @param index 标签的 index
 * @param id 标签的 id
 * @param status 标签的保存状态
 * @param positionType 标签位置分组
 * @param allowMove 是否允许移动
 * @param active 是否是按下状态
 * @param focus 是否是焦点
 * @param scale 缩放比例
 * @param styleTransition 缩放过渡
 * @param direction 目标语言的方向
 * @param writingMode 目标语言的书写模式
 * @param originDirection 源标语言的方向
 * @param originWritingMode 源语言的书写模式
 */
export const Label: FC<LabelProps> = ({
  index,
  id,
  status = 'pending',
  positionType = SOURCE_POSITION_TYPE.IN,
  allowMove = true,
  active = false,
  focus = false,
  scale = 1,
  content,
  styleTransition = '',
  direction = 'ltr',
  writingMode = 'vertical-rl',
  originDirection = 'ltr',
  originWritingMode = 'vertical-rl',
  className,
  children,
}) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const saving = labelSavingStatuses.includes(status);
  const { formatMessage } = useIntl();
  // 处理内容
  let isContentEmpty = false;
  if (content === undefined) {
    content = `[${formatMessage({ id: 'label.defaultContent' })}]`;
    isContentEmpty = true;
  } else if (content === '') {
    content = `[${formatMessage({ id: 'label.emptyContent' })}]`;
    isContentEmpty = true;
  }
  // 计算小箭头指向点的偏移，使小箭头的尖角为指向点
  let arrowWidth = 8; // 等腰三角形的底边
  let arrowHeight = 5; // 等腰三角形的高
  const numberSize = 29; // 数字圆圈的直径
  let numberTop = -16; // 数字圆圈的偏移
  // 手机版数字圆圈距离更远，以免小箭头被手挡住
  if (isMobile) {
    numberTop = -32;
  }
  let numberLeft = 0;
  let arrowTransform = 'translate(-50%, -100%)'; // 小箭头的偏移
  if (writingMode === 'horizontal-tb') {
    if (direction === 'ltr') {
      arrowTransform = 'translate(-100%, -50%)';
      numberLeft = -arrowHeight / 2;
    } else if (direction === 'rtl') {
      arrowTransform = 'translate(0, -50%)';
      numberLeft = arrowHeight / 2;
    }
  }
  let backgroundRGB = '255, 150, 156'; // 粉色
  if (positionType === SOURCE_POSITION_TYPE.OUT) {
    backgroundRGB = '255, 213, 131'; // 黄色
  }
  if (active) {
    arrowWidth *= 1.4;
    arrowHeight *= 1.4;
  }
  const numberBorderSize = 2;
  return (
    <div
      css={css`
        width: 0px;
        height: 0px;
        @keyframes focus-ring-animate {
          0% {
            opacity: 0;
            transform: scale(2.5);
            border-width: 1.8px;
          }
          10% {
            opacity: 0.2;
          }
          100% {
            opacity: 1;
            transform: scale(1);
            border-width: 2px;
          }
        }
        .Label__ContentWrapper {
          display: none;
          position: absolute;
          top: ${numberTop - numberSize / 2 - arrowHeight - 10}px;
          left: ${numberSize / 2 + 7}px;
          width: 220px;
        }
        .Label__Content {
          background-color: #fff;
          border-radius: ${style.borderRadiusSm};
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
          padding: 3px 5px;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .Label__Content--empty {
          color: ${style.textColorSecondary};
        }
        .Label__FocusRing {
          display: none;
          position: absolute;
          pointer-events: none;
          border: 1.8px solid rgb(${backgroundRGB});
          width: ${numberSize}px;
          height: ${numberSize}px;
          top: ${numberTop - numberSize / 2 - numberSize / 2}px;
          left: ${-numberSize / 2}px;
          border-radius: 50%;
          transform-origin: center;
          animation: focus-ring-animate 2s linear infinite normal;
        }
        &.Label--focus {
          .Label__Number {
            top: ${numberTop + numberBorderSize}px;
            background-color: rgba(${backgroundRGB}, 1);
            border: ${numberBorderSize}px solid rgba(255, 255, 255, 1);
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
          }
          .Label__FocusRing {
            display: block;
          }
        }
        @media (pointer: fine) {
          &:hover {
            .Label__Number {
              top: ${numberTop + numberBorderSize}px;
              background-color: rgba(${backgroundRGB}, 1);
              border: ${numberBorderSize}px solid rgba(255, 255, 255, 1);
            }
            .Label__ContentWrapper {
              display: flex;
            }
          }
        }
        .Label__Number {
          transition:
            opacity 200ms,
            background-color 200ms;
          position: absolute;
          top: ${numberTop}px;
          left: ${numberLeft}px;
          transform: translate(-50%, -100%);
          width: ${numberSize}px;
          height: ${numberSize}px;
          line-height: ${numberSize}px;
          border-radius: 50%;
          background-color: rgba(${backgroundRGB}, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          /* 显示数字超过 100，自动缩小文字大小 */
          font-size: ${index > 98
            ? Math.floor(numberSize / 1.8)
            : Math.floor(numberSize / 1.4)}px;
          font-family: ${style.labelFontFamily};
          font-weight: 400;
          /* 修正字体偏移 */
          letter-spacing: -1px;
          padding-top: 1px;
          padding-right: 1px;
          /* END 修正字体偏移 */
          transform-origin: top left;
          pointer-events: auto;
          box-sizing: content-box;
          cursor: ${allowMove ? '' : 'not-allowed;'};
        }
        .Label__Arrow {
          position: absolute;
          top: 0;
          left: 0;
          transform: ${arrowTransform};
          transition: border-width 200ms;
          width: 0;
          height: 0;
          &.Label__Arrow--bottom {
            border-style: solid;
            border-width: ${arrowHeight}px ${arrowWidth / 2}px 0
              ${arrowWidth / 2}px;
            border-color: ${style.primaryColor} transparent transparent
              transparent;
          }
          &.Label__Arrow--left {
            border-style: solid;
            border-width: ${arrowWidth / 2}px ${arrowHeight}px
              ${arrowWidth / 2}px 0;
            border-color: transparent ${style.primaryColor} transparent
              transparent;
          }
          &.Label__Arrow--right {
            border-style: solid;
            border-width: ${arrowWidth / 2}px 0 ${arrowWidth / 2}px
              ${arrowHeight}px;
            border-color: transparent transparent transparent
              ${style.primaryColor};
          }
        }
        .Label__Spin {
          display: none;
          position: absolute;
          left: -9px;
          top: -12px;
        }
        &.Label--saving {
          .Label__Spin {
            display: block;
          }
        }
      `}
      style={{
        transition: styleTransition,
        transform: `scale(${scale}) translateZ(0)`,
      }} // translateZ(0) 用于修复 Safari 上缩放导致的模糊
      className={classNames(className, 'Label', {
        'Label--focus': focus,
        'Label--active': active,
        'Label--saving': saving,
      })}
    >
      <div className="Label__FocusRing"></div>
      <div
        className="Label__Number"
        onContextMenu={(e) => e.preventDefault()} // 禁止鼠标右键菜单
      >
        {children}
      </div>
      <div
        className={classNames([
          'Label__Arrow',
          {
            'Label__Arrow--bottom':
              writingMode === 'vertical-lr' || writingMode === 'vertical-rl',
            'Label__Arrow--right':
              writingMode === 'horizontal-tb' && direction === 'ltr',
            'Label__Arrow--left':
              writingMode === 'horizontal-tb' && direction === 'rtl',
          },
        ])}
      ></div>
      <div className="Label__Spin">
        <Spin />
      </div>
      <div className="Label__ContentWrapper">
        <div
          className={classNames('Label__Content', {
            'Label__Content--empty': isContentEmpty,
          })}
        >
          {content}
        </div>
      </div>
      {/* 标记位置示例 */}
      {/* <LabelTextExample
        visible={active}
        direction={direction}
        writingMode={writingMode}
        originDirection={originDirection}
        originWritingMode={originWritingMode}
      ></LabelTextExample> */}
    </div>
  );
};
Label.whyDidYouRender = true;
