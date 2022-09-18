import { Language } from "./language";

// 项目目标
export interface Target {
  id: string;
  language: Language;
  translatedSourceCount: number;
  checkedSourceCount: number;
  createTime: string;
  editTime: string;
  intro: string;
}
