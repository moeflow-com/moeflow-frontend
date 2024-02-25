import dayjs from 'dayjs';
import { APISource } from '../apis/source';
import { APITranslation } from '../apis/translation';
import { SourceTranslationState } from '../interfaces';
import { Translation } from '../interfaces/translation';

export const isValidTranslation = (
  translation: Translation | undefined,
): boolean => {
  if (!translation) {
    return false;
  }
  return Boolean(
    translation.content || translation.proofreadContent || translation.selected,
  );
};

export const filterValidTranslations = (
  translations: (Translation | undefined)[],
): Translation[] => {
  return translations.filter(isValidTranslation) as Translation[];
};

export const getSortedTranslations = (source: APISource): APITranslation[] => {
  // 筛选有效翻译
  const translations = filterValidTranslations(source.translations);
  // 将自己的翻译加入
  if (isValidTranslation(source.myTranslation)) {
    translations.unshift(source.myTranslation as Translation);
  }
  // 将翻译按修改时间排序
  translations.sort((a, b) => {
    const isBefore = dayjs.utc(a.editTime).isBefore(dayjs.utc(b.editTime));
    return isBefore ? 1 : -1;
  });
  // 将已选中的翻译放在第一个
  const selectedTranslationIndex = translations.findIndex(
    (translation) => translation.selected,
  );
  const hasSelectedTranslation = selectedTranslationIndex > -1;
  if (hasSelectedTranslation) {
    const translation = translations[selectedTranslationIndex];
    translations.splice(selectedTranslationIndex, 1);
    translations.unshift(translation);
  }
  return translations;
};

export const getBestTranslation = (
  source: APISource,
): APITranslation | undefined => {
  return getSortedTranslations(source)[0];
};

export const checkTranslationState = (
  source: APISource,
): SourceTranslationState => {
  const translations = [...source.translations];
  if (source.myTranslation) {
    translations.unshift(source.myTranslation);
  }
  const validTranslations = filterValidTranslations(translations);
  let statusLine: SourceTranslationState;
  if (validTranslations.length > 0) {
    if (validTranslations.some((t) => t.selected)) {
      statusLine = 'translationOk';
    } else {
      if (validTranslations.length === 1) {
        statusLine = 'needCheckTranslation';
      } else {
        statusLine = 'needSelectAndCheckTranslation';
      }
    }
  } else {
    statusLine = 'needTranslation';
  }
  return statusLine;
};
