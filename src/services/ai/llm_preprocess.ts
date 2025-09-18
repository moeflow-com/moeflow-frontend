import { z } from 'zod';
import {
  generateText,
  GenerateTextOptions,
  SystemMessage,
  UserMessage,
} from 'xsai';
import { tool } from '@xsai/tool';
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
  ...['gemini-2.5-flash', 'gemini-2.5-pro'].map((model) => ({
    provider: 'Google',
    model,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  })),
  // OpenAI models: see https://platform.openai.com/docs/models
  ...['gpt-5-mini', 'gpt-4o', 'gpt-5'].map((model) => ({
    provider: 'OpenAI',
    model,
    baseUrl: 'https://api.openai.com/v1/',
  })),
  // Anthropic models in OpenAI compatible format: https://docs.claude.com/en/api/openai-sdk
  ...['claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest'].map((model) => ({
    provider: 'Anthropic',
    model,
    baseUrl: 'https://api.anthropic.com/v1/',
  })),
];

const filePreprocessResultSchema = z.object({
  imageW: z.number({ message: 'the width of the image in PX' }),
  imageH: z.number({ message: 'the height of the image in PX' }),
  texts: z.array(
    z.object({
      left: z
        .number()
        .describe('left coordinate of the text in PX, in the whole image'),
      top: z
        .number()
        .describe('top coordinate of the text in PX, in the whole image'),
      width: z.number().describe('width of the text in PX'),
      height: z.number().describe('height of the text in PX'),
      textLines: z.array(z.string()).describe('the text lines'),
      text: z.string().describe('concatenated original text'),
      translated: z.string().describe('translated text'),
      comment: z
        .string()
        .describe('additional comment of the text, or the translation'),
    }),
  ),
});

export type FilePreprocessResult = z.infer<typeof filePreprocessResultSchema>;

export async function llmTranslateImage(
  llmConf: LLMConf,
  targetLang: string,
  imgBlob: Blob,
  abortSignal?: AbortSignal,
): Promise<FilePreprocessResult> {
  const userMessage: UserMessage = {
    role: 'user',
    content: [
      {
        type: 'text',
        text: `Please translate the image to ${targetLang}. ${llmConf.extraPrompt || ''}`,
      },
      {
        type: 'image_url',
        image_url: {
          url: await img2dataurl(imgBlob),
          detail: 'high',
        },
      },
    ],
  };

  const messages: (UserMessage | SystemMessage)[] = [
    {
      content:
        'You are a helpful assistant. Please do as user instructs. The extracted text and translations should be submitted using the provided tool.',
      role: 'system',
    },
    userMessage,
  ];

  let ret = await callModelWithTools();
  if (llmConf.model?.toLowerCase().includes('gemini-')) {
    debugLogger('gemini workaround: set coords to 1000 scale');
    ret = {
      ...ret,
      // gemini-only workaround: gemini returns coords in [0, 1000] scale
      // see https://ai.google.dev/gemini-api/docs/image-understanding
      imageH: 1000,
      imageW: 1000,
    };
  }
  return ret;

  //
  async function callModelWithTools(): Promise<FilePreprocessResult> {
    let submittedResult: FilePreprocessResult | null = null;
    const submitTool = await tool({
      execute: (_result) => {
        submittedResult = _result;
        return 'saved';
      },
      parameters: filePreprocessResultSchema,
      name: 'submit',
      description: 'Submit the result of preprocessing the image',
    });

    const generateConf: GenerateTextOptions = {
      messages,
      headers: {
        // Anthropic-only workaround, to call API from browser (otherwise it rejects with CORS error).
        ...(llmConf.model.toLowerCase().includes('claude-') && {
          'anthropic-dangerous-direct-browser-access': 'true',
        }),
      },
      tools: [submitTool],
      baseURL: llmConf.baseUrl,
      model: llmConf.model,
      apiKey: llmConf.apiKey,
      abortSignal,
    };
    await generateText(generateConf);

    if (!submittedResult) {
      throw new Error('LLM did not submit the result using the tool.');
    }
    return submittedResult;
  }
}

async function img2dataurl(img: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(img);
  });
}
