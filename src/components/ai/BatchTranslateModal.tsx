import { FC } from 'react';
import { File as MFile } from '@/interfaces';
import { Target } from '@/interfaces';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import { ResourcePool } from '@jokester/ts-commonutil/lib/concurrency/resource-pool-basic';
import { getCancelToken } from '@/utils/api';
import { useAsyncEffect } from '@jokester/ts-commonutil/lib/react/hook/use-async-effect';
import { createDebugLogger } from '@/utils/debug-logger';
import { api, resultTypes } from '@/apis';
import { toLowerCamelCase } from '@/utils';
import {
  llmTranslateImage,
  LLMConf,
  FilePreprocessResult,
} from '@/services/ai/llm_preprocess';
import { ModalHandle } from '.';
import { Icon } from '../icon';

const debugLogger = createDebugLogger('components:ai:BatchTranslateModal');
interface FileProgress {
  file: MFile;
  icon: React.ReactNode | string;
  message?: React.ReactNode | string;
}

function clipTo01(x: number) {
  return Math.max(0, Math.min(1, x));
}

const stateIcons = {
  waiting: <Icon icon="ellipsis-h" />,
  working: <Icon icon="spinner" spin />,
  skip: <Icon icon="exclamation-circle" />,
  fail: <Icon icon="exclamation-circle" />,
  success: <Icon icon="check" />,
} as const;

export const BatchTranslateModalContent: FC<{
  llmConf: LLMConf;
  files: MFile[];
  target: Target;
  onFileSaved?(f: MFile): void;
  getHandle(): ModalHandle;
}> = ({ files, target, getHandle, llmConf, onFileSaved }) => {
  const { formatMessage } = useIntl();
  const [fileStates, setFileStates] = useState<FileProgress[]>(() =>
    files.map(
      (file): FileProgress => ({
        file,
        icon: stateIcons.waiting,
        message: formatMessage({
          id: 'fileList.aiTranslate.fileMessage.waiting',
        }),
      }),
    ),
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
    released = released.then(() => {
      debugLogger('released');
    });
    const tasksEnded = Promise.allSettled(
      files.map((f) => fileLimiter.use(() => translateFile(f))),
    );
    const cancelled = await Promise.race([
      released.then(() => true),
      tasksEnded.then(() => false),
    ]);
    debugLogger('cancelled', cancelled);
    if (!cancelled) {
      const handle = getHandle();
      handle.update({ okButtonProps: { disabled: false } });
    }
    return;

    function setFileState(f: MFile, message: string, icon: React.ReactNode) {
      debugLogger('setFileState', f.id, message);
      setFileStates((prev) =>
        prev.map((state) =>
          state.file === f ? { ...state, message, icon } : state,
        ),
      );
    }

    async function translateFile(f: MFile) {
      setFileState(
        f,
        formatMessage({ id: 'fileList.aiTranslate.fileMessage.sendingImage' }),
        stateIcons.working,
      );
      if (![undefined, null, 'success'].includes(f.uploadState)) {
        setFileState(
          f,
          formatMessage({
            id: 'fileList.aiTranslate.fileMessage.uploadNotFinished',
          }),
          stateIcons.skip,
        );
        return;
      }
      const refetchRes = await api.file
        .getFile({ fileID: f.id, configs: { cancelToken } })
        .catch(() => null);
      if (refetchRes?.type !== resultTypes.SUCCESS) {
        setFileState(
          f,
          formatMessage({
            id: 'fileList.aiTranslate.fileMessage.failFetchingImage',
          }),
          stateIcons.fail,
        );
        return;
      }
      const resData = toLowerCamelCase(refetchRes.data);
      if (resData.sourceCount) {
        setFileState(
          f,
          formatMessage({
            id: 'fileList.aiTranslate.fileMessage.textAlreadyExist',
          }),
          stateIcons.skip,
        );
        return;
      }
      const imgBlob = await fetch(resData.url!, { signal: abort.signal }).then(
        (r) => r.blob(),
        () => null,
      );
      if (!imgBlob) {
        setFileState(
          f,
          formatMessage({
            id: 'fileList.aiTranslate.fileMessage.failFetchingImage',
          }),
          stateIcons.fail,
        );
        return;
      }

      setFileState(
        f,
        formatMessage({ id: 'fileList.aiTranslate.fileMessage.translating' }),
        stateIcons.working,
      );

      const result = await llmTranslateImage(
        llmConf,
        target.language.enName,
        imgBlob,
      ).catch((e: unknown) => {
        debugLogger('translate failed', e);
        return null;
      });
      debugLogger('translate result', result);
      if (!running.current) {
        return;
      }

      if (result) {
        await saveTranslations(f, result);
      } else {
        setFileState(
          f,
          formatMessage({
            id: 'fileList.aiTranslate.fileMessage.translateFailed',
          }),
          stateIcons.fail,
        );
      }
    }

    async function saveTextBlock(
      f: MFile,
      tf: FilePreprocessResult,
      tb: FilePreprocessResult['texts'][number],
    ) {
      const src = await api.source.createSource({
        fileID: f.id,
        data: {
          x: clipTo01((tb.left + tb.width / 2) / tf.imageW),
          y: clipTo01((tb.top + tb.height / 2) / tf.imageH),
          content: tb.text,
        },
        configs: { cancelToken },
      });
      await api.translation.createTranslation({
        sourceID: src.data.id,
        data: {
          content: tb.translated,
          targetID: target.id,
        },
        // not using the cancel token, to make the saving operation closer to atomic
        // configs: { cancelToken },
      });
    }

    async function saveTranslations(f: MFile, r: FilePreprocessResult) {
      if (r.texts.length === 0) {
        setFileState(
          f,
          formatMessage({
            id: 'fileList.aiTranslate.fileMessage.noTextDetected',
          }),
          stateIcons.skip,
        );
      }
      setFileState(
        f,
        formatMessage({ id: 'fileList.aiTranslate.fileMessage.saving' }),
        stateIcons.working,
      );
      try {
        await Promise.all(
          r.texts.map((tb) =>
            moeflowApiLimiter.use(() => saveTextBlock(f, r, tb)),
          ),
        );
        setFileState(
          f,
          formatMessage(
            { id: 'fileList.aiTranslate.fileMessage.success' },
            { count: r.texts.length },
          ),
          stateIcons.success,
        );
        onFileSaved?.({
          ...f,
          sourceCount: r.texts.length,
          translatedSourceCount: r.texts.length,
        });
      } catch (e) {
        debugLogger('save text block failed', e);
        setFileState(
          f,
          formatMessage({ id: 'fileList.aiTranslate.fileMessage.failSaving' }),
          stateIcons.fail,
        );
      }
    }
  }, []);
  return (
    <div>
      <p>
        {formatMessage(
          { id: 'fileList.aiTranslate.workingModal.content' },
          { fileCount: files.length },
        )}
      </p>
      <ul>
        {fileStates.map((state) => (
          <li key={state.file.id}>
            <span style={{ margin: '0 4px' }}>{state.icon}</span>
            {state.file.name} - {state.message}
          </li>
        ))}
      </ul>
    </div>
  );
};
