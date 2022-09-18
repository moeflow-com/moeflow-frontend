import React from 'react';

// 增加了 whyDidYouRender 属性的 React.FC
export type FC<P = {}> = React.FC<P> & {
  whyDidYouRender?: any;
};

// 文本方向定义
export type Direction = 'ltr' | 'rtl';
export type WritingMode = 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';

// 系统名称
export type OSName = 'macos' | 'windows' | 'linux' | 'ios' | undefined;
export type Platform = 'desktop' | 'tablet' | 'mobile' | undefined;
