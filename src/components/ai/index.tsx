import { Modal } from 'antd';
import { File as MFile, Target } from '@/interfaces';
import { createDebugLogger } from '@/utils/debug-logger';
import { ModalStaticFunctions } from 'antd/lib/modal/confirm';

import { ModelConfigForm } from './ModelConfigForm';
import { BatchTranslateModalContent } from './BatchTranslateModal';
import { useMemo } from 'react';
import { LLMConf, testModel, llmPresets } from '@/services/ai/llm_preprocess';

const debugLogger = createDebugLogger('components:project:FileListAiTranslate');

export type ModalHandle = ReturnType<typeof Modal.confirm>;

interface TranslatorApi {
  start(
    onFileSaved: (f: MFile) => void,
    onConfigured?: () => void,
  ): Promise<void>;
  testModel(modelConf: LLMConf): Promise<{ worked: boolean; message: string }>;
}
function bind(
  files: MFile[],
  target: Target,
  modal: ModalStaticFunctions,
): TranslatorApi {
  return {
    start,
    testModel,
  };
  async function start() {
    const llmConf = await new Promise<LLMConf | null>((resolve, reject) => {
      let confValue: LLMConf = { ...llmPresets.at(0)! };
      const onChange = (conf: LLMConf) => {
        debugLogger('model configured', conf);
        confValue = conf;
        if (confValue.model && confValue.baseUrl && confValue.apiKey) {
          handle.update({ okButtonProps: {} });
        }
      };
      const handle = modal.confirm({
        icon: null,
        content: (
          <ModelConfigForm initialValue={confValue} onChange={onChange} />
        ),
        okText: `Start translate`,
        okButtonProps: { disabled: true },
        onOk: () => {
          resolve(confValue);
        },
        onCancel: () => {
          resolve(null);
        },
      });
    });
    if (!llmConf) {
      return;
    }

    await new Promise<boolean>((resolve) => {
      const handle = modal.confirm({
        icon: null,
        content: (
          <BatchTranslateModalContent
            llmConf={llmConf}
            files={files}
            target={target}
            getHandle={() => handle as ModalHandle}
          />
        ),
        okButtonProps: { disabled: true },
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  }
}

export function useAiTranslate(
  files: MFile[],
  target: Target,
): [true, TranslatorApi, React.ReactNode] | [false, null, null] {
  const [modal, contextHolder] = Modal.useModal();

  const api = useMemo(
    () => bind(files, target, modal as ModalStaticFunctions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target.id, files.map((file) => file.id).join('|')],
  );

  return [true, api, contextHolder];
}
