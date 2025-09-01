import { Modal } from 'antd';
import { FC, File as MFile, Target } from '@/interfaces';
import {
  useMoeflowCompanion,
  moeflowCompanionServiceState,
  MoeflowCompanionService,
  TranslatedFile,
} from '@/services/ai/use_moeflow_companion';
import { useAsyncEffect } from '@jokester/ts-commonutil/lib/react/hook/use-async-effect';
import { createDebugLogger } from '@/utils/debug-logger';
import { api, resultTypes } from '@/apis';
import { useIntl } from 'react-intl';
import { ModalStaticFunctions } from 'antd/lib/modal/confirm';
import { useState } from 'react';
import { ResourcePool } from '@jokester/ts-commonutil/lib/concurrency/resource-pool-basic';
import { getCancelToken } from '@/utils/api';
import { toLowerCamelCase } from '@/utils';

const debugLogger = createDebugLogger('components:project:FileListAiTranslate');

type ModalHandle = ReturnType<typeof Modal.confirm>;

interface TranslatorFunc {
  (files: MFile[], target: Target): void;
}
function openTranslateModal(
  files: MFile[],
  target: Target,
  service: MoeflowCompanionService,
  modal: ModalStaticFunctions,
) {
  const handle = modal.confirm({
    content: (
      <ModalContent
        service={service}
        files={files}
        target={target}
        getHandle={() => handle}
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
}

export function useMoeflowCompanionAiTranslate():
  | [true, TranslatorFunc, React.ReactNode]
  | [false, null, null] {
  const [serviceState, service] = useMoeflowCompanion();
  const [modal, contextHolder] = Modal.useModal();

  debugLogger('service', serviceState, service);
  if (serviceState !== moeflowCompanionServiceState.connected) {
    return [false, null, null];
  }

  return [
    true,
    (files, target) =>
      openTranslateModal(
        files,
        target,
        service!,
        modal as ModalStaticFunctions,
      ),
    contextHolder,
  ];
}

interface TranslateTaskState {
  file: MFile;
  status: string;
}

function clipTo01(x: number) {
  return Math.max(0, Math.min(1, x));
}

const ModalContent: FC<{
  service: MoeflowCompanionService;
  files: MFile[];
  target: Target;
  getHandle(): ModalHandle;
}> = ({
  service: { client, serviceConf, multimodalTranslate },
  files,
  target,
  getHandle,
}) => {
  const intl = useIntl();
  const [fileStates, setFileStates] = useState<TranslateTaskState[]>(() =>
    files.map((file) => ({ file, status: 'waiting' })),
  );
  useAsyncEffect(async (running, released) => {
    const [cancelToken, fillCancelToken] = getCancelToken();
    const fileLimiter = ResourcePool.multiple([1, 2]);
    const moeflowApiLimiter = ResourcePool.multiple([1, 2, 3, 4]);
    const abort = new AbortController();
    released.then(() => fillCancelToken('unmounted'));
    released.then(() => abort.abort('unmounted'));

    if (!running.current) {
      debugLogger('canceled');
      return;
    }
    const tasksEnded = Promise.allSettled([
      files.map((f, idx) => fileLimiter.use(() => translateFile(f, idx))),
    ]);
    const cancelled = await Promise.race([
      released.then(() => true),
      tasksEnded.then(() => false),
    ]);
    if (!cancelled) {
      const handle = getHandle();
      handle.update({ okButtonProps: { disabled: false } });
    }
    return;

    function setFileState(f: MFile, status: string) {
      setFileStates((prev) =>
        prev.map((state) => (state.file === f ? { ...state, status } : state)),
      );
    }

    async function translateFile(f: MFile, idx: number) {
      setFileState(f, 'working');
      if (![undefined, null, 'success'].includes(f.uploadState)) {
        setFileState(f, 'skip: upload not finished');
        return;
      }
      const refetchRes = await api.file
        .getFile({ fileID: f.id })
        .catch(() => null);
      if (refetchRes?.type !== resultTypes.SUCCESS) {
        setFileState(f, 'skip: fetch file failed');
        return;
      }
      const resData = toLowerCamelCase(refetchRes.data);
      if (resData.sourceCount) {
        setFileState(f, 'skip: source count not 0');
      }
      const imgBlob = await fetch(resData.url!, {
        // mode: 'no-cors',
      }).then(
        (r) => r.blob(),
        () => null,
      );
      if (!imgBlob) {
        setFileState(f, 'skip: fetch image blob failed');
        return;
      }

      const result = await multimodalTranslate(
        client,
        [imgBlob],
        target.language.enName,
        serviceConf!.defaultMultimodalModel!,
      ).catch((e) => {
        debugLogger('translate failed', e);
        return [];
      });
      debugLogger('translate result', result);

      const [r] = result;

      if (r) {
        await saveTranslations(f, r);
      } else {
        setFileState(f, 'error: translate failed');
      }
    }

    async function saveTextBlock(
      f: MFile,
      tf: TranslatedFile,
      tb: TranslatedFile['text_blocks'][number],
    ) {
      const src = await api.source.createSource({
        fileID: f.id,
        data: {
          x: clipTo01((tb.left + tb.right) / 2 / tf.image_w),
          y: clipTo01((tb.top + tb.bottom) / 2 / tf.image_h),
          content: tb.source,
        },
        configs: { cancelToken },
      });
      await api.translation.createTranslation({
        sourceID: src.data.id,
        data: {
          content: tb.translated,
          targetID: target.id,
        },
        configs: { cancelToken },
      });
    }

    async function saveTranslations(f: MFile, r: TranslatedFile) {
      if (r.text_blocks.length === 0) {
        setFileState(f, 'done: no text blocks');
      }
      setFileState(f, 'saving');
      try {
        await Promise.all(
          r.text_blocks.map((tb) =>
            moeflowApiLimiter.use(() => saveTextBlock(f, r, tb)),
          ),
        );
        setFileState(
          f,
          `success: translated ${r.text_blocks.length} text marks`,
        );
      } catch (e) {
        debugLogger('save text block failed', e);
        setFileState(f, 'save file failed');
      }
    }
  }, []);
  return (
    <div>
      {files.length} files to translate
      <ul>
        {fileStates.map((state) => (
          <li key={state.file.id}>
            {state.file.name} - {state.status}
          </li>
        ))}
      </ul>
    </div>
  );
};
