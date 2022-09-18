import { GROUP_PERMISSION, GROUP_ALLOW_APPLY_TYPE } from './group';

// 项目允许加入的类型
export const PROJECT_ALLOW_APPLY_TYPE = {
  ...GROUP_ALLOW_APPLY_TYPE,
  TEAM_USER: 3,
};

// 项目权限
export const PROJECT_PERMISSION = {
  ...GROUP_PERMISSION,
  FINISH: 1010,
  ADD_FILE: 1020,
  MOVE_FILE: 1030,
  RENAME_FILE: 1040,
  DELETE_FILE: 1050,
  OUTPUT_TRA: 1060,
  ADD_LABEL: 1080,
  MOVE_LABEL: 1090,
  DELETE_LABEL: 1100,
  ADD_TRA: 1110,
  DELETE_TRA: 1120,
  PROOFREAD_TRA: 1130,
  CHECK_TRA: 1140,
};

// 项目状态
export enum PROJECT_STATUS {
  WORKING = 0,
  FINISHED = 1,
}

// 从 LP 导入状态
export enum IMPORT_FROM_LABELPLUS_STATUS {
  PENDING = 0, // 排队中
  RUNNING = 1, // 进行中
  SUCCEEDED = 2, // 成功
  ERROR = 3, // 错误
}

// 从 LP 导入错误
export enum IMPORT_FROM_LABELPLUS_ERROR_TYPE {
  UNKNOWN = 0, // 未知
  NO_TARGET = 1, // 运行时，没有的翻译目标
  NO_CREATOR = 2, // 项目没有创建人
  PARSE_FAILED = 3, // 解析失败
}
