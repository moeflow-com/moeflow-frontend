import { Role } from './role';

// 团队
export interface Team {
  groupType: 'team';
  id: string;
  name: string;
  intro: string;
  hasAvatar: boolean;
  avatar: string | null;
  allowApplyType: number;
  isNeedCheckApplication: boolean;
  maxUser: number;
  userCount: number;
  createTime: string;
  editTime: string;
  joined?: boolean;
  role?: Role;
  ocrQuotaMonth: number;
  ocrQuotaUsed: number;
}
// 用户的团队（包含角色）
export interface UserTeam extends Team {
  role: Role;
}
