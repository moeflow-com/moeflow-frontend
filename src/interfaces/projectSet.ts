// 项目集
export interface ProjectSet {
  id: string;
  name: string;
  intro: string;
  default: boolean;
  createTime: string;
  editTime: string;
}
// 用户的项目集
export interface UserProjectSet extends ProjectSet {}
