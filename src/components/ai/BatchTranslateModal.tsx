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
import { llmPresets, llmPreprocessFile } from '@/services/ai/llm_preprocess';
import { ModalHandle } from '.';

const debugLogger = createDebugLogger('components:ai:BatchTranslateModal');
interface TranslateTaskState {
  file: MFile;
  status: string;
}

function clipTo01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export const BatchTranslateModalContent: FC<{
  modelConf: MultimodalModelConf;

  files: MFile[];
  target: Target;
  getHandle(): ModalHandle;
}> = ({ files, target, getHandle }) => {
  const intl = useIntl();
  const [fileStates, setFileStates] = useState<TranslateTaskState[]>(() =>
    files.map((file) => ({ file, status: 'waiting' })),
  );

  async function startWork() {}
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

      const result = await llmPreprocessFile(
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

const WorkModalContent: FC<{}> = (props) => {};
