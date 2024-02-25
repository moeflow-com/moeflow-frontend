import { css, SerializedStyles } from '@emotion/core';
import style from '../style';

export const hover = (hover: SerializedStyles | string) => {
  return css`
    /* 只有主设备是精准 pointer（如鼠标），才应用 :hover */
    @media (pointer: fine) {
      &:hover {
        ${hover};
      }
    }
  `;
};

interface ClickEffect {
  (
    hover?: SerializedStyles | string,
    active?: SerializedStyles | string,
  ): SerializedStyles;
}
/** 对手机友好的点击效果 */
export const clickEffect: ClickEffect = (
  hover = `background-color: ${style.hoverColor};`,
  active = `background-color: ${style.activeColor};`,
) => {
  return css`
    cursor: pointer;
    user-select: none;
    /* 只有主设备是精准 pointer（如鼠标），才应用 :hover */
    @media (pointer: fine) {
      &:hover {
        ${hover};
      }
    }
    &:active {
      ${active};
    }
  `;
};
/** 清除默认的的点击效果 */
export const clearClickEffect = () => {
  return css`
    cursor: auto;
    user-select: none;
    /* 只有主设备是精准 pointer（如鼠标），才应用 :hover */
    @media (pointer: fine) {
      &:hover {
        background-color: inherit;
      }
    }
    &:active {
      background-color: inherit;
    }
  `;
};
export const imageClickEffect = () => {
  return clickEffect('filter: brightness(93%);', 'filter: brightness(85%);');
};
export const cardClickEffect = () => {
  return clickEffect(
    css`
      /* transform: translate(0px, -5px); */
      box-shadow: 0 2px 10px #bbbbbb;
      border: 1px solid #bbbbbb;
    `,
    css`
      box-shadow: 0px 2px 4px #cecece;
      border: 1px solid #cecece;
    `,
  );
};
export const cardActiveEffect = () => {
  return css`
    box-shadow: 0px 2px 4px #cecece;
    border: 1px solid ${style.primaryColorLighter} !important;
  `;
};
/** 列表元素样式 */
export const listItemStyle = () => {
  return css`
    flex: none;
    display: flex;
    height: 45px;
    width: 100%;
    align-items: center;
    color: ${style.textColor};
    transition: background-color 150ms;
    .left {
      flex: auto;
      display: flex;
      align-items: center;
      height: 100%;
      padding-left: ${style.paddingBase}px;
      overflow: hidden;
      .logo {
        flex: none;
        margin-right: 10px;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: ${style.paddingBase}px;
      }
      .icon {
        flex: none;
        margin-left: auto;
        color: ${style.textColorSecondaryLightest};
        width: 45px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .right-button {
      width: 45px;
      height: 100%;
      flex: none;
      margin-left: auto;
      padding: 0 ${style.paddingBase}px;
      display: flex;
      justify-content: center;
      align-items: center;
      ${clickEffect()};
      .icon {
        color: ${style.textColorSecondaryLightest};
      }
    }
    &.active {
      background-color: ${style.selectedColor};
      .right-button {
        .icon {
          color: ${style.textColorSecondary};
        }
      }
    }
  `;
};
