import z from 'zod';
import { generateObject, GenerateObjectOptions, UserMessage } from 'xsai';

interface MultimodalModelConf {
  provider: string;
  model: string;
  baseUrl: string;
}

export const multimodalPresets: readonly Readonly<MultimodalModelConf>[] = [
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

const fileRecognizeResultSchema = z.object({
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
      tranalated: z.string({ message: 'translated text' }),
      comment: z.string({
        message: 'additional comment of the text, or the translation',
      }),
    }),
  ),
});

export type FileRecognizeResult = z.infer<typeof fileRecognizeResultSchema>;

export async function recognizeFile(
  apiKey: string,
  conf: MultimodalModelConf,
  msg: UserMessage,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof fileRecognizeResultSchema>> {
  const generateConf: GenerateObjectOptions<typeof fileRecognizeResultSchema> =
    {
      messages: [
        {
          content: 'You are a helpful assistant. Please do as user instructs.',
          role: 'system',
        },
        msg,
      ],
      schema: fileRecognizeResultSchema,
      baseURL: conf.baseUrl,
      model: conf.model,
      apiKey,
    };
  const res = await generateObject({
    ...generateConf,
    abortSignal,
  });
  return res.object;
}
