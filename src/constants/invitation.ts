// 邀请加入状态
export const INVITATION_STATUS = {
  PENDING: 1 as 1,
  ALLOW: 2 as 2,
  DENY: 3 as 3,
};
export type InvitationStatuses = typeof INVITATION_STATUS[keyof typeof INVITATION_STATUS];
