import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BatchSelectTranslationData } from '@/apis/translation';
import { InputDebounceStatus, Source } from '@/interfaces';
import { User } from '@/interfaces/user';

export type SavingStatus = 'saving' | 'saveSuccessful' | 'saveFailed';
export type FocusEffect = 'focusInput' | 'focusLabel' | 'scrollIntoView';

export interface SourceState {
  readonly loading: boolean;
  readonly batchSelecting: boolean;
  readonly savingStatus: SavingStatus;
  readonly sources: Source[];
  readonly focusedSource: {
    id: string;
    effects: FocusEffect[];
    noises: Record<FocusEffect, string>;
  };
}

export const initialState: SourceState = {
  loading: true,
  batchSelecting: false,
  savingStatus: 'saveSuccessful',
  sources: [],
  focusedSource: {
    id: '',
    effects: [],
    noises: {
      focusInput: '',
      focusLabel: '',
      scrollIntoView: '',
    },
  },
};

export interface EditMyTranslationSagaAction {
  sourceID: string;
  targetID: string;
  content: string;
  noDebounce?: boolean;
  focus?: boolean;
}
export interface EditProofreadSagaAction {
  sourceID: string;
  translationID: string;
  proofreadContent: string;
  noDebounce?: boolean;
}

export interface Singl {}
const slice = createSlice({
  name: 'source',
  initialState,
  reducers: {
    fetchSourcesSaga(
      state,
      action: PayloadAction<{ fileID: string; targetID: string }>,
    ) {},
    setSavingStatus(state, action: PayloadAction<SavingStatus>) {
      state.savingStatus = action.payload;
    },
    setSourcesLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setBatchSelecting(state, action: PayloadAction<boolean>) {
      state.batchSelecting = action.payload;
    },
    setSources(state, action: PayloadAction<Source[]>) {
      state.sources = action.payload;
    },
    createSourceSaga(
      state,
      action: PayloadAction<{
        fileID: string;
        x: number;
        y: number;
        positionType: number;
      }>,
    ) {},
    createSource(state, action: PayloadAction<Source>) {
      state.sources.push(action.payload);
    },
    editSourceSaga(
      state,
      action: PayloadAction<{
        id: string;
        x?: number;
        y?: number;
        content?: string;
        positionType?: number;
        reset?: () => void;
      }>,
    ) {},
    editSource(
      state,
      action: PayloadAction<Partial<Source> & { id: string; newID?: string }>,
    ) {
      const index = state.sources.findIndex(
        (source) => source.id === action.payload.id,
      );
      if (index > -1) {
        const { newID, ...newSource } = action.payload;
        if (newID) {
          newSource.id = newID;
        }
        state.sources[index] = {
          ...state.sources[index],
          ...newSource,
        };
      }
    },
    editSourceMyTranslationContent(
      state,
      action: PayloadAction<{
        sourceID: string;
        content: string;
        editTime: string;
      }>,
    ) {
      const index = state.sources.findIndex(
        (source) => source.id === action.payload.sourceID,
      );
      if (index > -1) {
        if (state.sources[index].myTranslation) {
          state.sources[index].myTranslation!.content = action.payload.content;
          state.sources[index].myTranslation!.editTime =
            action.payload.editTime;
        } else {
          // 当还没有 myTranslation 时先创建一个，只用到里面的 content 参数，用于创建失败后 retry
          state.sources[index].myTranslation = {
            sourceID: action.payload.sourceID,
            id: '',
            mt: false,
            content: action.payload.content,
            user: null,
            proofreadContent: '',
            proofreader: null,
            selected: false,
            selector: null,
            createTime: action.payload.editTime,
            editTime: action.payload.editTime,
            target: {} as any,
          };
        }
      }
    },
    deleteSourceSaga(state, action: PayloadAction<{ id: string }>) {},
    deleteSource(state, action: PayloadAction<{ id: string }>) {
      const index = state.sources.findIndex(
        (source) => source.id === action.payload.id,
      );
      if (index > -1) {
        state.sources.splice(index, 1);
      }
    },
    rerankSourceSaga(
      state,
      action: PayloadAction<{ id: string; next_source_id: string | 'end' }>,
    ) {
      // placeholder for the saga worker
    },
    rerankSource(
      state,
      action: PayloadAction<{ id: string; next_source_id: string | 'end' }>,
    ) {
      const index = state.sources.findIndex((s) => s.id === action.payload.id);
      if (index < 0) {
        // should not happen
        return;
      }

      if (action.payload.next_source_id === 'end') {
        const [source] = state.sources.splice(index, 1);
        state.sources.push(source);
      } else {
        if (
          !state.sources.find((s) => s.id === action.payload.next_source_id)
        ) {
          // should not happen
          return;
        }
        const [source] = state.sources.splice(index, 1);

        const otherIndex = state.sources.findIndex(
          (s) => s.id === action.payload.next_source_id,
        );
        state.sources.splice(otherIndex, 0, source);
      }
    },
    focusSource(
      state,
      action: PayloadAction<{
        id: string;
        effects?: FocusEffect[];
        noises?: FocusEffect[];
      }>,
    ) {
      const { id, effects = [], noises = [] } = action.payload;
      const timestamp = new Date().getTime().toString();
      // 添加噪声
      const newNoises = { ...state.focusedSource.noises };
      for (const key of noises) {
        newNoises[key] = timestamp;
      }
      state.focusedSource = { id, effects, noises: newNoises };
      for (const source of state.sources) {
        if (source.id === action.payload.id) {
          source.focus = true;
        } else {
          source.focus = false;
        }
      }
    },
    // 翻译部分
    editMyTranslationSaga(
      state,
      action: PayloadAction<EditMyTranslationSagaAction>,
    ) {},
    batchSelectTranslationSaga(
      state,
      action: PayloadAction<{
        fileID: string;
        data: BatchSelectTranslationData;
      }>,
    ) {},
    selectTranslationSaga(
      state,
      action: PayloadAction<{
        sourceID: string;
        translationID: string;
        selected: boolean;
      }>,
    ) {},
    selectTranslation(
      state,
      action: PayloadAction<{
        sourceID: string;
        translationID: string;
        selected: boolean;
        selector: User | null;
      }>,
    ) {
      const { sourceID, translationID, selected, selector } = action.payload;
      const index = state.sources.findIndex((source) => source.id === sourceID);
      if (index > -1) {
        const source = state.sources[index];
        const translations = [...source.translations];
        if (source.myTranslation) {
          translations.push(source.myTranslation);
        }
        for (const translation of translations) {
          if (selected) {
            if (translation.id === translationID) {
              translation.selected = true;
              translation.selector = selector;
            } else {
              translation.selected = false;
              translation.selector = null;
            }
          } else {
            translation.selected = false;
            translation.selector = null;
          }
        }
      }
    },
    deleteTranslation(
      state,
      action: PayloadAction<{
        sourceID: string;
        translationID: string;
      }>,
    ) {
      const { sourceID, translationID } = action.payload;
      const index = state.sources.findIndex((source) => source.id === sourceID);
      if (index > -1) {
        const source = state.sources[index];
        if (source.myTranslation?.id === translationID) {
          source.myTranslation = undefined;
        } else {
          source.translations = source.translations.filter(
            (t) => t.id !== translationID,
          );
        }
      }
    },
    editProofreadSaga(state, action: PayloadAction<EditProofreadSagaAction>) {},
    editProofread(
      state,
      action: PayloadAction<{
        sourceID: string;
        translationID: string;
        proofreadContent: string;
        proofreader: User | null;
        editTime: string;
      }>,
    ) {
      const {
        sourceID,
        translationID,
        proofreadContent,
        proofreader,
        editTime,
      } = action.payload;
      const index = state.sources.findIndex((source) => source.id === sourceID);
      if (index > -1) {
        const source = state.sources[index];
        const translations = [...source.translations];
        if (source.myTranslation) {
          translations.push(source.myTranslation);
        }
        const translationIndex = translations.findIndex(
          (translation) => translation.id === translationID,
        );
        translations[translationIndex].proofreadContent = proofreadContent;
        translations[translationIndex].proofreader = proofreader;
        translations[translationIndex].editTime = editTime;
      }
    },
    editProofreadContentStatuses(
      state,
      action: PayloadAction<{
        sourceID: string;
        translationID: string;
        status: InputDebounceStatus | undefined;
      }>,
    ) {
      const { sourceID, translationID, status } = action.payload;
      const index = state.sources.findIndex((source) => source.id === sourceID);
      if (index > -1) {
        state.sources[index].proodreadContentStatuses[translationID] = status;
      }
    },
  },
});

export const {
  setSavingStatus,
  setSourcesLoading,
  fetchSourcesSaga,
  setSources,
  createSourceSaga,
  createSource,
  editSourceSaga,
  editSource,
  editSourceMyTranslationContent,
  rerankSourceSaga,
  rerankSource,
  deleteSourceSaga,
  deleteSource,
  focusSource,
  deleteTranslation,
  editMyTranslationSaga,
  setBatchSelecting,
  batchSelectTranslationSaga,
  selectTranslationSaga,
  selectTranslation,
  editProofreadSaga,
  editProofread,
  editProofreadContentStatuses,
} = slice.actions;
export default slice.reducer;
