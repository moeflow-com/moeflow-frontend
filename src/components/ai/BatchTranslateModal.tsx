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
  testModel,
  llmPreprocessFile,
  LLMConf,
  FilePreprocessResult,
} from '@/services/ai/llm_preprocess';
import { ModalHandle } from '.';
import { UserMessage } from 'xsai';

const debugLogger = createDebugLogger('components:ai:BatchTranslateModal');
interface TranslateTaskState {
  file: MFile;
  status: string;
}

function clipTo01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export const BatchTranslateModalContent: FC<{
  llmConf: LLMConf;

  files: MFile[];
  target: Target;
  getHandle(): ModalHandle;
}> = ({ files, target, getHandle, llmConf }) => {
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
      const imgBlob = await fetch(resData.url!, {}).then(
        (r) => r.blob(),
        () => null,
      );
      if (!imgBlob) {
        setFileState(f, 'skip: fetch image blob failed');
        return;
      }

      const userMessage: UserMessage = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please translate the image to ${target.language.enName}. ${llmConf.extraPrompt || ''}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: await img2dataurl(imgBlob),
            },
          },
        ],
      };

      const result = await llmPreprocessFile(llmConf, userMessage).catch(
        (e) => {
          debugLogger('translate failed', e);
          return null;
        },
      );
      debugLogger('translate result', result);

      if (result) {
        await saveTranslations(f, result);
      } else {
        setFileState(f, 'error: translate failed');
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
        configs: { cancelToken },
      });
    }

    async function saveTranslations(f: MFile, r: FilePreprocessResult) {
      if (r.texts.length === 0) {
        setFileState(f, 'done: no text blocks');
      }
      setFileState(f, 'saving');
      try {
        await Promise.all(
          r.texts.map((tb) =>
            moeflowApiLimiter.use(() => saveTextBlock(f, r, tb)),
          ),
        );
        setFileState(f, `success: translated ${r.texts.length} text marks`);
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

async function img2dataurl(img: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(img);
  });
}
