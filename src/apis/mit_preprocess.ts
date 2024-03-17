import { request } from '.';

async function createTask(files: File[]) {
  return request({
    method: 'POST',
    url: '/v1/mit-preprocess/jobs',
    data: {
      files: [],
    },
  });
}

async function getTask(taskId: string) {
  return request({
    method: 'GET',
    url: `/v1/mit-preprocess/jobs/${taskId}`,
  });
}

export const mitPreprocess = {
  createTask,
  getTask,
} as const;
