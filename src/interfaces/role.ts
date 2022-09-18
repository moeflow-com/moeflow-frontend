// 角色/权限
export interface Permission {
  id: number;
  name: string;
  intro: string;
}
export interface Role {
  create_time: string;
  id: string;
  level: number;
  name: string;
  permissions: Permission[];
  systemCode?: string;
}
