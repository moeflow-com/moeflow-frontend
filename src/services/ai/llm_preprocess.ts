import z from 'zod';
import { generateObject, GenerateObjectOptions, UserMessage } from 'xsai';

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
  return res.object;
}
