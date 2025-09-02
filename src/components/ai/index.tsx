import { Modal } from 'antd';
import { File as MFile, Target } from '@/interfaces';
import { createDebugLogger } from '@/utils/debug-logger';
import { ModalStaticFunctions } from 'antd/lib/modal/confirm';

import { ModelConfigForm } from './ModelConfigForm';
import { BatchTranslateModalContent } from './BatchTranslateModal';
import { useCallback, useMemo } from 'react';
import { LLMConf } from '@/services/ai/llm_preprocess';

const debugLogger = createDebugLogger('components:project:FileListAiTranslate');

export type ModalHandle = ReturnType<typeof Modal.confirm>;

interface TranslatorApi {
  start(
    onFileSaved: (f: MFile) => void,
    onConfigured?: () => void,
  ): Promise<void>;
}
function bind(
  files: MFile[],
  target: Target,
  modal: ModalStaticFunctions,
): TranslatorApi {
  return {
    start,
  };
  async function start() {
    const modelConfigured = await new Promise<LLMConf>((resolve, reject) => {
      const handle = modal.confirm({
        style: { width: 600 },
        icon: null,
        content: <ModelConfigForm />,
        okText: `start auto translate`,
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
    if (!modelConfigured) {
      return;
    }

    const f = await new Promise((resolove, reject) => {
      const handle = modal.confirm({
        content: (
          <BatchTranslateModalContent
            files={files}
            target={target}
            getHandle={() => handle as ModalHandle}
          />
        ),
        okButtonProps: { disabled: true },
        onOk: () => {
          console.log('ok');
        },
        onCancel: () => {
          console.log('cancel');
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
    [files, target, modal],
  );

  return [true, api, contextHolder];
}
