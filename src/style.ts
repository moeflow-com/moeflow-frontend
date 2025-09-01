/**
 * 这个文件会在 npm run build 时
 * 供 vite.config.ts 引用，来覆盖 antd 默认值
 */
/** 转换格式（不引用 utils 中的，防止也被 ts 编译） */
function toHyphenCase(value: string | { [propNames: string]: any }) {
  function stringToHyphenCase(value: string) {
    return value.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  if (typeof value === 'string') {
    return stringToHyphenCase(value);
  } else {
    const newValue: { [key: string]: any } = {};
    for (const key in value) {
      newValue[stringToHyphenCase(key)] = value[key];
    }
    return newValue;
  }
}

// antd 中同名的样式变量
// see also: https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
const antdVars = {
  // 颜色表
  primaryColor: '#FF657C',
  infoColor: '#62a4ca',
  successColor: '#52c41a',
  processingColor: '#1890ff',
  errorColor: '#f5222d',
  highlightColor: '#f5222d',
  warningColor: '#faad14',
  normalColor: '#d9d9d9',
  // 文字颜色
  textColor: 'rgba(0, 0, 0, 0.85)', // 基本色
  textColorSecondary: 'rgba(0, 0, 0, 0.45)', // 辅助色
  textColorInverse: '#fff', // 基本色 - 反色
  // 边框阴影
  borderRadiusBase: '8px',
  borderRadiusSm: '4px',
  borderColorBase: '#dbdbdb',
  boxShadowBase:
    '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),0 9px 28px 8px rgba(0, 0, 0, 0.05)',
};
// 其他公用样式变量
const otherVars = {
  labelFontFamily: "'Label Number', sans-serif",
  // 编辑器颜色
  translatorColorBackground: '#4f4f4f',
  // 背景颜色
  backgroundColorLight: '#fafafa',
  backgroundFocus: '#fffbe3',
  // 文字颜色
  textColorLight: 'rgba(0, 0, 0, 0.75)',
  textColorLighter: 'rgba(0, 0, 0, 0.65)',
  textColorLightest: 'rgba(0, 0, 0, 0.55)',
  textColorSecondaryLight: 'rgba(0, 0, 0, 0.35)',
  textColorSecondaryLighter: 'rgba(0, 0, 0, 0.25)',
  textColorSecondaryLightest: 'rgba(0, 0, 0, 0.15)',
  // 主颜色
  primaryColorDarker: '#d94c66',
  primaryColorLighter: '#ff8f9c',
  primaryColorLightest: '#ffbdc5',
  // 警告颜色
  warningColorLighter: '#ffd583',
  warningColorLightest: '#ffe0a4',
  // 按下动效颜色
  hoverColor: '#eee', // hover 悬停颜色
  activeColor: '#d9d9d9', // active 按下颜色
  selectedColor: '#e3e3e3', // 选中后激活的颜色
  // 图片翻译器按钮颜色
  widgetButtonHoverBackgroundColor: 'rgba(182, 182, 182, 0.6)', // hover 悬停背景颜色
  widgetButtonActiveBackgroundColor: 'rgba(202, 202, 202, 0.6)', // active 选中背景颜色
  widgetButtonActiveColor: '#999', // active 按下文字颜色
  // 导航条
  navHeight: 40,
  navHeightM: 45,
  tabBarHeightM: 50,
  // 边框
  borderColorLight: '#eeeeee',
  borderColorLighter: '#f7f7f7;',
  contentMaxWidth: 520,
  // 其他
  headerHeight: 60,
  avatarBorderColor: '#eeeeee',
  paddingBase: 15,
};
// antd mobile 中同名的样式变量（不导出到 style）
const antdVarsM = {
  fillBody: '#fff', // 背景色
  fillTap: otherVars.activeColor,
  brandPrimary: antdVars.primaryColor, // 主颜色
  colorTextBase: antdVars.textColor, // 基本色
  colorTextBaseInverse: antdVars.textColorInverse, // 基本色 - 反色
  colorTextSecondary: antdVars.textColorSecondary, // 辅助色
};
// 供项目中直接引用
export default {
  ...antdVars,
  ...otherVars,
} as const;
// 供 config-overrides.js 引用，转换成 antd Less 连字符格式，用于覆盖其 Less 配置
export const antdLessVars = toHyphenCase(antdVars) as Record<string, string>;
export const antdLessVarsM = toHyphenCase(antdVarsM) as Record<string, string>;
