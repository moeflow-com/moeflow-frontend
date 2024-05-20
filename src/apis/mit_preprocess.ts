import { request } from '.';
import { uploadRequest } from './_request';
import { wait } from '@jokester/ts-commonutil/lib/concurrency/timing';

const mitApiPrefix = `/v1/mit`;

interface MitPreprocessResponse {
  id: string;
  result?: MitPreprocessResult;
  status: 'success' | 'pending' | 'fail';
  message?: string;
}

export interface MitPreprocessResult {
  target_lang: string;
  text_quads: TextQuad[];
}

type CoordTuple = [number, number]; // x, y  in non-normalized pixels
export type BBox = [CoordTuple, CoordTuple, CoordTuple, CoordTuple]; // left-top, right-top, right-bottom, left-bottom

export interface TextQuad {
  pts: BBox;
  raw_text: string;
  translated: string;
}

async function uploadImg(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return uploadRequest<{ filename: string }>(formData, {
    method: 'POST',
    url: `${mitApiPrefix}/images`,
  });
}

async function createImgTask(
  filename: string,
  taskName: 'mit_ocr' | 'mit_detect_text',
  payload: object,
) {
  return request<{ task_id: string }>({
    method: 'POST',
    url: `${mitApiPrefix}/image-tasks`,
    data: {
      task_name: taskName,
      filename,
      ...payload,
    },
  });
}

interface TaskState<Result> {
  task_id: string;
  status: 'success' | 'pending' | 'fail';
  result?: Result;
  message?: string;
}

async function waitImgTask<Result>(taskId: string) {
  while (true) {
    const r = await request<TaskState<Result>>({
      method: 'GET',
      url: `${mitApiPrefix}/image-tasks/${taskId}`,
    });
    if (r.data.status === 'success') {
      return r.data.result!;
    } else if (r.data.status === 'pending') {
      await wait(2e3);
    } else {
      throw new Error(`task failed: ${r.data.message ?? 'unknown'}`);
    }
  }
}

async function createTranslateTask(payload: object) {
  return request<{ task_id: string }>({
    method: 'POST',
    url: `${mitApiPrefix}/translate-tasks`,
    data: {
      ...payload,
    },
  });
}

async function waitTranslateTask(taskId: string) {
  while (true) {
    const r = await request<TaskState<string[]>>({
      method: 'GET',
      url: `${mitApiPrefix}/translate-tasks/${taskId}`,
    });
    if (r.data.status === 'success') {
      return r.data.result!;
    } else if (r.data.status === 'pending') {
      await wait(1e3);
    } else {
      throw new Error(`task failed: ${r.data.message ?? 'unknown'}`);
    }
  }
}

export const mitPreprocess = {
  uploadImg,
  createImgTask,
  waitImgTask,
  createTranslateTask,
  waitTranslateTask,
} as const;
