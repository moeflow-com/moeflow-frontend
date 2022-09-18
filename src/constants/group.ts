// 团队允许加入的类型
export const GROUP_ALLOW_APPLY_TYPE = {
  NONE: 1,
  ALL: 2,
};
// 所有团体类型公用的权限
export const GROUP_PERMISSION = {
  // 基础权限，为0 - 99
  ACCESS: 1,
  DELETE: 5,
  CHANGE: 10,
  CREATE_ROLE: 15,
  DELETE_ROLE: 20,
  // 加入流程权限，为 100 - 199
  CHECK_USER: 101,
  INVITE_USER: 105,
  DELETE_USER: 110,
  CHANGE_USER_ROLE: 115,
  CHANGE_USER_REMARK: 120,
  // 自定义权限为 1000 以上
};
// 申请加入如何检查
export const APPLICATION_CHECK_TYPE = {
  NO_NEED_CHECK: 1,
  ADMIN_CHECK: 2,
};
