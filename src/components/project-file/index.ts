import { lazy } from 'react';

export const ImageViewer = lazy(() =>
  import('./ImageViewer').then((module) => ({ default: module.ImageViewer })),
);

export const ImageSourceViewer = lazy(() =>
  import('./ImageSourceViewer').then((module) => ({
    default: module.ImageSourceViewer,
  })),
);
export { ImageTranslatorSettingMouse } from './ImageTranslatorSettingMouse';
export { ImageTranslatorSettingHotKey } from './ImageTranslatorSettingHotKey';
