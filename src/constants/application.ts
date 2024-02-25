// 申请加入状态
export const APPLICATION_STATUS = {
  PENDING: 1 as 1,
  ALLOW: 2 as 2,
  DENY: 3 as 3,
};
export type ApplicationStatuses =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
