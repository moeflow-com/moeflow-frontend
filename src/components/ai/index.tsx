import { Modal } from 'antd';
import { File as MFile, Target } from '@/interfaces';
import { createDebugLogger } from '@/utils/debug-logger';
import { ModalStaticFunctions } from 'antd/lib/modal/confirm';

import { ModelConfigForm } from './ModelConfigForm';
import { BatchTranslateModalContent } from './BatchTranslateModal';

const debugLogger = createDebugLogger('components:project:FileListAiTranslate');

export type ModalHandle = ReturnType<typeof Modal.confirm>;

interface TranslatorFunc {
  (files: MFile[], target: Target, onSaved?: (f: MFile) => void): void;
}
async function openTranslateModal(
  files: MFile[],
  target: Target,
  modal: ModalStaticFunctions,
) {
  const modelConfigured = await new Promise<boolean>((resolve, reject) => {
    const handle = modal.confirm({
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

export function useMoeflowCompanionAiTranslate():
  | [true, TranslatorFunc, React.ReactNode]
  | [false, null, null] {
  const [modal, contextHolder] = Modal.useModal();

  return [
    true,
    (files, target) =>
      openTranslateModal(files, target, modal as ModalStaticFunctions),
    contextHolder,
  ];
}
