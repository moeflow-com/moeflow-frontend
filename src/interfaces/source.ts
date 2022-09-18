import { APISource } from '../apis/source';

export const labelSavingStatuses = ['creating', 'saving', 'deleting'];

export type LabelStatus =
  | 'creating' // 创建中
  | 'saving' // 保存修改中
  | 'deleting' // 删除中
  | 'pending'; // 等待操作

export type InputDebounceStatus =
  | 'debouncing' // 保存防抖中
  | 'saving' // 保存中
  | 'saveFailed' // 保存失败
  | 'saveSuccessful'; // 保存成功

export interface ProofreadContentStatuses {
  [translationID: string]: InputDebounceStatus | undefined;
}

export interface Source extends APISource {
  isTemp: boolean;
  focus: boolean;
  selecting: boolean; // 选择翻译中
  labelStatus: LabelStatus;
  myTranslationContentStatus?: InputDebounceStatus;
  proodreadContentStatuses: ProofreadContentStatuses;
}

export type SourceTranslationState =
  | 'needTranslation'
  | 'needCheckTranslation'
  | 'needSelectAndCheckTranslation'
  | 'translationOk';
