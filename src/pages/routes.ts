export const routes = {
  index: '/',
  login: '/login',
  signUp: '/register',
  resetPassword: '/reset-password',
  dashboard: {
    $: '/dashboard',
    user: {
      setting: '/dashboard/user/setting',
    },
  },
  imageTranslator: {
    asRouter: `/image-translator/:fileID-:targetID`,
    build: (fileId: string, targetId: string) =>
      `/image-translator/${fileId}-${targetId}`,
  },
  mit: {
    preprocessDemo: '/mit/preprocess-demo',
  },
  admin: '/admin',
} as const;
