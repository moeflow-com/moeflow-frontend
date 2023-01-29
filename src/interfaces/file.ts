import {
  FileNotExistReasons,
  FileSafeStatuses,
  FileTypes,
  ParseStatuses,
} from "../constants";

// 文件目标缓存
export interface FileTargetCache {
  translatedSourceCount: number;
  checkedSourceCount: number;
}

// 文件
export interface File {
  id: string;
  name: string;
  saveName: string;
  type: FileTypes;
  sourceCount: number;
  translatedSourceCount: number;
  checkedSourceCount: number;
  safeStatus: FileSafeStatuses;
  fileNotExistReason: FileNotExistReasons;
  parseStatus: ParseStatuses;
  parseStatusDetailName: string;
  parseErrorTypeDetailName: string;
  parentID: string | null;
  fileTargetCache?: FileTargetCache;
  // 图片文件专用
  url?: string;
  coverUrl?: string;
  safeCheckUrl?: string;
  nextImage?: File;
  prevImage?: File;
  imageOcrPercent?: number;
  imageOcrPercentDetailName?: string;
  // 上传中的文件
  uploading?: boolean;
  uploadOverwrite?: boolean;
  uploadState?: "uploading" | "success" | "failure";
  uploadPercent?: number; // 1-100
}
