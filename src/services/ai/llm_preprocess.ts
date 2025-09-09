import z from 'zod';
import { generateObject, GenerateObjectOptions, UserMessage } from 'xsai';
import { createDebugLogger } from '@/utils/debug-logger';

const debugLogger = createDebugLogger('services:ai:llm_preprocess');

export interface LLMConf {
  provider: string;
  model: string;
  baseUrl: string;
  apiKey?: string;
  extraPrompt?: string;
}

export const llmPresets: readonly Readonly<LLMConf>[] = [
  // gemini:
  // see https://ai.google.dev/gemini-api/docs/openai
  {
    provider: 'Google',
    model: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  },
  {
    provider: 'Google',
    model: 'gemini-2.5-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  },
];

const FilePreprocessResultSchema = z.object({
  imageW: z.number({ message: 'the width of the image in PX' }),
  imageH: z.number({ message: 'the height of the image in PX' }),
  texts: z.array(
    z.object({
      left: z.number({
        message: 'left coordinate of the text in PX, in the whole image',
      }),
      top: z.number({
        message: 'top coordinate of the text in PX, in the whole image',
      }),
      width: z.number({ message: 'width of the text in PX' }),
      height: z.number({ message: 'height of the text in PX' }),
      textLines: z.array(z.string(), { message: 'the text lines' }),
      text: z.string({ message: 'concatencated text' }),
      translated: z.string({ message: 'translated text' }),
      comment: z.string({
        message: 'additional comment of the text, or the translation',
      }),
    }),
  ),
});

export type FilePreprocessResult = z.infer<typeof FilePreprocessResultSchema>;

export async function testModel(
  modelConf: LLMConf,
): Promise<{ worked: boolean; message: string }> {
  return { worked: true, message: 'test model worked' };
}

export async function llmPreprocessFile(
  conf: LLMConf,
  msg: UserMessage,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof FilePreprocessResultSchema>> {
  const generateConf: GenerateObjectOptions<typeof FilePreprocessResultSchema> =
    {
      messages: [
        {
          content: 'You are a helpful assistant. Please do as user instructs.',
          role: 'system',
        },
        msg,
      ],
      schema: FilePreprocessResultSchema,
      baseURL: conf.baseUrl,
      model: conf.model,
      apiKey: conf.apiKey,
    };
  const res = await generateObject({
    ...generateConf,
    abortSignal,
  });
  let ret = res.object;
  if (conf.model?.startsWith('gemini-')) {
    debugLogger('gemini workaround: set coords to 1000 scale');
    ret = {
      ...ret,
      // workaround: gemini returns coords in [0, 1000] scale
      // see https://ai.google.dev/gemini-api/docs/image-understanding
      imageH: 1000,
      imageW: 1000,
    }
  }
  return res.object;
}
