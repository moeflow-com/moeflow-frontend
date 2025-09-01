interface MultimodalModelConf {
  provider: string;
  model: string;
  baseUrl: string;
}

export const multimodalPresets: readonly MultimodalModelConf[] = [
  // gemini:
  // see https://ai.google.dev/gemini-api/docs/openai
  {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  },
  {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  },
];

export async function x();
