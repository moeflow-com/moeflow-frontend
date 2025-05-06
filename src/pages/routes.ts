export const routes = {
  index: '/',
  login: '/login',
  signUp: '/register',
  resetPassword: '/reset-password',
  dashboard: {
    $: '/dashboard',
    user: {
      setting: '/dashboard/user/setting',
      invitations: `/dashboard/user/invitations`,
      relatedApplications: '/dashboard/user/related-applications',
    },
    project: {
      new: `/dashboard/new-project`,
      show: `/dashboard/projects/:projectId`,
      asRouter: `/dashboard/projects/:projectId`,
    },
  },
  imageTranslator: {
    asRouter: `/image-translator/:fileID-:targetID`,
    build: (fileId: string, targetId: string) =>
      `/image-translator/${fileId}-${targetId}`,
  },
  admin: '/admin',
} as const;
