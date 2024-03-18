import { FC } from '../../interfaces';
import { RefObject, useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import { css } from '@emotion/core';
import { Button } from '../Button';
import { createMoeflowProjectZip, LPFile } from './moeflow-packager';
import { api } from '../../apis';
import { wait } from '@jokester/ts-commonutil/lib/concurrency/timing';
import { measureImgSize } from '@jokester/ts-commonutil/lib/frontend/measure-img';
import { sumBy, clamp } from 'lodash-es';
import { TextQuad } from '../../apis/mit_preprocess';

const MAX_FILE_COUNT = 30;

function getQuadCenter(q: TextQuad) {
  const x = sumBy(q.pts, (p) => p[0]) / q.pts.length;
  const y = sumBy(q.pts, (p) => p[1]) / q.pts.length;
  return { x, y } as const;
}

async function translateFile(
  image: File,
  running: RefObject<boolean>,
): Promise<LPFile> {
  const size = await measureImgSize(image);
  const created = await api.mitPreprocess.createTask(image);
  console.debug('task created', image, size, created);
  while (running.current) {
    const task = await api.mitPreprocess.getTask(created.data.id);
    console.debug('task status', task.data.status, task);
    if (task.data.status === 'success') {
      const labels = task.data
        .result!.text_quads.sort((a, b) => {
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
        file_name: image.name,
        labels,
      };
    } else if (task.data.status !== 'fail') {
      await wait(1e3);
    } else {
      await wait(5e3);
      throw new Error(
        task.data?.message ??
          'error occured. please retry or report to me@jokester.io',
      );
    }
  }

  throw new Error('todo');
}

async function startOcr(
  files: File[],
  onProgress?: (finished: number, total: number) => void,
): Promise<File> {
  const translations: LPFile[] = [];
  for (const [i, f] of files.entries()) {
    const translated = await translateFile(f, { current: true });
    translations.push(translated);
    onProgress?.(i + 1, files.length);
  }
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
                  finished,
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
