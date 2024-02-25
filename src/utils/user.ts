import { Project, Team } from '../interfaces';

/**
 * 测试用户是否有某些权限
 * @param permission
 */
export const can = (
  group: Team | Project | undefined,
  permission: number,
): boolean => {
  if (group && group.role) {
    return group.role.permissions.findIndex((p) => p.id === permission) > -1;
  }
  return false;
};
