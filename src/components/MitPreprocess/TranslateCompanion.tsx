import { FC } from '../../interfaces';
import { RefObject, useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import { css } from '@emotion/core';
import { Button } from '../Button';
import { createMoeflowProjectZip, LPFile } from './moeflow-packager';
import { api } from '../../apis';
import { wait } from '@jokester/ts-commonutil/lib/concurrency/timing';
import { measureImgSize } from '@jokester/ts-commonutil/lib/frontend/measure-img';
import { sumBy } from 'lodash-es';

const MAX_FILE_COUNT = 20;

async function translateFile(
  image: File,
  running: RefObject<boolean>,
): Promise<LPFile> {
  const size = await measureImgSize(image);
  const created = await api.mitPreprocess.createTask(image);
  console.debug('task created', created);
  while (running.current) {
    const task = await api.mitPreprocess.getTask(created.data.id);
    console.debug('task status', created);
    if (task.data.status === 'success') {
      return {
        file_name: image.name,
        // TODO: should sort the bubbles
        labels: task.data.result!.text_quads.map((q) => {
          const x = sumBy(q.pts, (p) => p[0]) / q.pts.length;
          const y = sumBy(q.pts, (p) => p[1]) / q.pts.length;
          return {
            x: x / size.width,
            y: y / size.height,
            position_type: 1,
            translation: q.translated,
          };
        }),
      };
    } else if (task.data.status !== 'fail') {
      await wait(1e3);
    }
  }
  throw new Error('todo');
}

async function startOcr(files: File[]): Promise<File> {
  const translations: LPFile[] = [];
  for (const f of files) {
    const translated = await translateFile(f, { current: true });
    translations.push(translated);
  }
  const zipBlob = await createMoeflowProjectZip(
    {
      name: `${files[0]!.name}`,
      intro: `这是由<萌翻+MitOCR demo>生成的项目. https://moeflow-mit-poc.voxscape.io/temp/mit-preprocess`,
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

export const DemoOcrFiles: FC<{}> = (props) => {
  const [working, setWorking] = useState(false);
  const [origFiles, setOrigFiles] = useState<File[]>(() => []);
  const [error, setError] = useState<string | null>(null);
  const [translated, setTranslated] = useState<File | null>(null);
  const filePondRef = useRef<null | FilePond>(null);

  const onStartOcr = async (files: File[]) => {
    try {
      setWorking(true);
      setTranslated(await startOcr(files));
    } catch (e: any) {
      alert(e?.message || 'error');
      console.error(e);
    } finally {
      setWorking(false);
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
        disabled={working || origFiles.length > 0}
        onClick={() => filePondRef.current?.browse()}
        type="button"
        icon="plus"
      >
        1. Select up to ${MAX_FILE_COUNT} image files {error}
      </Button>
      <Button
        disabled={working || !origFiles.length}
        onClick={() => onStartOcr(origFiles)}
        type="button"
      >
        2. Start
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
        3. Download project.zip you can import to moeflow
      </Button>
    </div>
  );
};
