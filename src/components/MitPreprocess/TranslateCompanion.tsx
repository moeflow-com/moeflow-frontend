import { FC } from '../../interfaces';
import { RefObject, useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import { css } from '@emotion/core';
import { Button } from '../Button';
import { createMoeflowProjectZip, LPFile } from './moeflow-packager';
import { FailureResults } from '../../apis';
import { measureImgSize } from '@jokester/ts-commonutil/lib/frontend/measure-img';
import { clamp } from 'lodash-es';
import {
  BBox,
  CoordPair,
  mitPreprocess,
  TextQuad,
} from '../../apis/mit_preprocess';
import { ResourcePool } from '@jokester/ts-commonutil/lib/concurrency/resource-pool';

const MAX_FILE_COUNT = 30;

function getQuadCenter(q: TextQuad) {
  const xs = q.pts.flatMap((pt) => pt.map((p) => p[0]));
  const ys = q.pts.flatMap((pt) => pt.map((p) => p[1]));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

function buildLpFile(
  img: File,
  size: { width: number; height: number },
  textQuads: TextQuad[],
): LPFile {
  const labels = textQuads
    .sort((a, b) => {
      // sort : top=>bottom , right=>left
      const ca = getQuadCenter(a);
      const cb = getQuadCenter(b);
      return Math.sign(ca.y - cb.y) || Math.sign(cb.x - ca.x);
    })
    .map((q) => {
      const { x, y } = getQuadCenter(q);
      return {
        x: clamp(x / size.width, 0, 1),
        y: clamp(y / size.height, 0, 1),
        position_type: 1,
        translation: `${q.raw_text}\n${q.translated}`,
      };
    });
  console.debug('labels', labels);
  return {
    file_name: img.name,
    labels,
  };
}

async function translateWithTask(
  text: string,
  targetLang = 'CHT',
): Promise<string> {
  const task = await mitPreprocess.createTranslateTask({
    query: text,
    target_lang: targetLang,
    translator: 'gpt4',
  });
  const result = await mitPreprocess.waitTranslateTask(task.data.task_id);
  return result[0] || '';
}

async function* startTranslateFile(
  image: File,
  running: RefObject<boolean>,
): AsyncGenerator<{
  progress?: string;
  failed?: FailureResults;
  detectTextResult?: unknown;
  ocrResult?: unknown;
  translateResult?: unknown;
  result?: LPFile;
}> {
  let uploaded;
  yield { progress: 'uploading' };
  try {
    uploaded = await mitPreprocess.uploadImg(image);
  } catch (e: unknown) {
    yield {
      failed: e as FailureResults,
    };
    return;
  }
  yield { progress: 'extracting text lines' };
  const { filename } = uploaded.data;

  let detectTextResult;
  try {
    const task = await mitPreprocess.createImgTask(
      filename,
      'mit_detect_text',
      {},
    );
    detectTextResult = await mitPreprocess.waitImgTask<{
      textlines: {
        prob: number;
        pts: BBox[];
        text: string;
        // textlines: any[]; // FIXME why did server return this?
      }[];
    }>(task.data.task_id);
  } catch (e: unknown) {
    yield {
      failed: e as FailureResults,
    };
    return;
  }

  yield { progress: 'recognizing text lines' };
  let ocrResult;
  try {
    const created = await mitPreprocess.createImgTask(filename, 'mit_ocr', {
      regions: detectTextResult.textlines,
    });
    ocrResult = await mitPreprocess.waitImgTask<
      {
        pts: BBox[];
        text: string;
        textlines: string[];
      }[]
    >(created.data.task_id);
    console.debug('ocrResult', ocrResult);
  } catch (e: unknown) {
    yield {
      failed: e as FailureResults,
    };
    return;
  }

  yield { progress: 'translating' };
  let translateResult: string[];
  try {
    const limiter = ResourcePool.multiple([1, 2, 3, 4]);
    translateResult = await Promise.all(
      ocrResult.map((textBlock) =>
        limiter.use(() => translateWithTask(textBlock.text)),
      ),
    );
  } catch (e: unknown) {
    yield {
      failed: e as FailureResults,
    };
    return;
  }

  const textQuads: TextQuad[] = ocrResult.map((textBlock, i) => ({
    pts: textBlock.pts,
    raw_text: textBlock.text,
    translated: translateResult[i] ?? '',
  }));

  const lpFile = buildLpFile(image, await measureImgSize(image), textQuads);

  yield {
    result: lpFile,
  };
}

async function translateFile(image: File, imageIndex: number): Promise<LPFile> {
  try {
    for await (const fileProgress of startTranslateFile(image, {
      current: true,
    })) {
      console.debug(
        `translating file #${imageIndex} / ${image.name}`,
        'step',
        fileProgress,
      );
      if (fileProgress.result) {
        return fileProgress.result;
      } else if (fileProgress.failed) {
        throw fileProgress.failed;
      } // else: continue
    }
  } catch (e) {
    console.error(`failed translating file #${imageIndex} / ${image.name}`, e);
    return {
      file_name: image.name,
      labels: [],
    };
  }
  throw new Error(`should not be here`);
}

async function startOcr(
  files: File[],
  onProgress?: (finished: number, total: number) => void,
): Promise<File> {
  const limiter = ResourcePool.multiple([1, 2]);

  const translations = await Promise.all(
    files.map((f, i) =>
      limiter.use(async () => {
        const lpFile = await translateFile(f, i);
        onProgress?.(i + 1, files.length);
        return lpFile;
      }),
    ),
  );
  const zipBlob = await createMoeflowProjectZip(
    {
      name: `${files[0]!.name}`,
      intro: `这是由<萌翻+Mit demo>生成的项目. https://moeflow-mit-poc.voxscape.io/temp/mit-preprocess`,
      default_role: 'supporter',
      allow_apply_type: 3,
      application_check_type: 1,
      is_need_check_application: true,
      source_language: 'ja',
      output_language: 'zh-TW',
    },
    translations.map((lp, i) => ({ lp, image: files[i] })),
  );
  return new File(
    [zipBlob],
    `moeflow-project-${Date.now()}-${files[0]!.name}.zip`,
  );
}

interface DemoWorkingState {
  nonce: string;
  numPages: number;
  finished: number;
}

export const DemoOcrFiles: FC<{}> = (props) => {
  const [working, setWorking] = useState<null | DemoWorkingState>(null);
  const [origFiles, setOrigFiles] = useState<File[]>(() => []);
  const [error, setError] = useState<string | null>(null);
  const [translated, setTranslated] = useState<File | null>(null);
  const filePondRef = useRef<null | FilePond>(null);

  const onStartOcr = async (files: File[]) => {
    try {
      const initState = {
        nonce: `${Math.random()}`,
        numPages: files.length,
        finished: 0,
      };
      setWorking(initState);
      setTranslated(
        await startOcr(files, (finished, total) =>
          setWorking((s) =>
            s?.nonce === initState.nonce
              ? {
                  ...s,
                  finished: Math.max(s.finished, finished),
                  numPages: total,
                }
              : s,
          ),
        ),
      );
    } catch (e: any) {
      alert(e?.message || 'error');
      console.error(e);
    } finally {
      setWorking(null);
    }
  };
  return (
    <div>
      <FilePond
        disabled={origFiles.length > 0}
        ref={(value) => (filePondRef.current = value)}
        css={css`
          display: none;
        `}
        allowMultiple
        acceptedFileTypes={['image/*', '.png', '.jpg']}
        onupdatefiles={(_files) => {
          const files = _files.map((f) => f.file) as File[];
          console.debug('onaddfile', files);
          if (!(files.length > 0 && files.length <= MAX_FILE_COUNT)) {
            setError(`一次最多只能上传${MAX_FILE_COUNT}张图片`);
            setOrigFiles([]);
            filePondRef.current!.removeFiles();
          } else {
            setOrigFiles(files);
            setError(null);
          }
        }}
      />
      <Button
        disabled={!!working || origFiles.length > 0}
        onClick={() => filePondRef.current?.browse()}
        type="button"
        icon="plus"
      >
        1. Select up to {MAX_FILE_COUNT} image files {error}
      </Button>
      <Button
        disabled={!!working || !origFiles.length || !!translated}
        onClick={() => onStartOcr(origFiles)}
        type="button"
      >
        {working
          ? `Working ... ${working.finished} / ${working.numPages} files done`
          : '2. Start'}
      </Button>
      <Button
        disabled={!translated}
        onClick={() => {
          const a = document.createElement('a');
          const u = (a.href = URL.createObjectURL(translated!));
          a.download = translated!.name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(u));
        }}
      >
        3. Download project.zip and import into moeflow
      </Button>
    </div>
  );
};
