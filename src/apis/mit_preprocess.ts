import { request } from '.';
import { uploadRequest } from './_request';

interface MitPreprocessResponse {
  id: string;
  result?: MitPreprocessResult;
  status: 'success' | 'pending' | 'fail';
}

export interface MitPreprocessResult {
  target_lang: string;
  text_quads: TextQuad[];
}

type CoordTuple = [number, number]; // x, y  in non-normalized pixels

interface TextQuad {
  pts: [CoordTuple, CoordTuple, CoordTuple, CoordTuple];
  raw_text: string;
  translated: string;
}

async function createTask(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return uploadRequest<{ id: string }>(formData, {
    method: 'POST',
    url: '/v1/mit/preprocess/tasks',
  });
}

async function getTask(taskId: string) {
  return request<MitPreprocessResponse>({
    method: 'GET',
    url: `/v1/mit/preprocess/tasks/${taskId}`,
  });
}

export const mitPreprocess = {
  createTask,
  getTask,
} as const;
