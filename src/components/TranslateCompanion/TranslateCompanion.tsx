import { FC } from '../../interfaces';
import { useRef, useState } from 'react';
import { FilePond } from 'react-filepond';
import { css } from '@emotion/core';
import { Button } from '../Button';
import { createMoeflowProjectZip, LPFile } from './moeflow-packager';

async function translateFile(image: File): Promise<LPFile> {
  return { file_name: image.name, labels: [] };
}

async function startOcr(files: File[]): Promise<File> {
  const translations: LPFile[] = [];
  for (const f of files) {
    const translated = await translateFile(f);
    translations.push(translated);
  }
  const zipBlob = await createMoeflowProjectZip(
    {
      name: `${files[0]!.name}`,
      intro: `这是由<萌翻OCR demo>生成的项目. https://moeflow.ihate.work/demo/ocr`,
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
          if (!(files.length > 0 && files.length <= 5)) {
            setError('一次最多只能上传5张图片');
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
        1. Select up to 5 image files {error}
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
