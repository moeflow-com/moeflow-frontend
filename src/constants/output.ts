// 导出进度
export enum OUTPUT_STATUS {
  QUEUING = 0, // 排队中
  DOWNLOADING = 1, // 源文件整理中
  TRANSLATION_OUTPUTING = 2, // 翻译整理中
  ZIPING = 3, // 压缩中
  SUCCEEDED = 4, // 完成
  ERROR = 5, // 导出错误，请重试
}
// 导出类型
export enum OUTPUT_TYPE {
  ALL = 0, // 所有内容
  ONLY_TEXT = 1, // 仅文本
}
