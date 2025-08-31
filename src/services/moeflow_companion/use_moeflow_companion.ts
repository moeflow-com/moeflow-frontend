import { useState, useRef } from 'react';
import { Client } from '@gradio/client';
import { useAsyncEffect } from '@jokester/ts-commonutil/lib/react/hook/use-async-effect';
import { useSelector } from 'react-redux';
import { AppState } from '@/store';
import { createDebugLogger } from '@/utils/debug-logger';
import { RuntimeConfig } from '@/configs';

export const moeflowCompanionServiceState = {
  disabled: 'disabled',
  connecting: 'connecting',
  connected: 'connected',
  disconnected: 'disconnected',
} as const;

const debugLogger = createDebugLogger('service:moeflow_companion');

export interface MoeflowCompanionService {
  client: Client;
  serviceConf: RuntimeConfig['moeflowCompanion'];
  multimodalTranslate: typeof multimodalTranslate;
}

export function useMoeflowCompanion(): [
  string,
  MoeflowCompanionService | null,
] {
  const serviceRef = useRef<MoeflowCompanionService | null>(null);
  const [clientState, setClientState] = useState<string>(
    moeflowCompanionServiceState.connecting,
  );
  const serviceConf = useSelector(
    (s: AppState) => s.site.runtimeConfig.moeflowCompanion,
  );

  useAsyncEffect(
    async (_, released) => {
      if (
        !(
          serviceConf &&
          serviceConf.gradioUrl &&
          serviceConf.defaultMultimodalModel
        )
      ) {
        serviceRef.current = null;
        setClientState(moeflowCompanionServiceState.disabled);
        return;
      }
      try {
        const client = await Client.connect(serviceConf.gradioUrl);
        serviceRef.current = {
          client,
          multimodalTranslate,
          serviceConf,
        };
        setClientState(moeflowCompanionServiceState.connected);
        released.then(() => client.close());
      } catch (e) {
        debugLogger('error connecting', e, serviceConf.gradioUrl);
        serviceRef.current = null;
        setClientState(moeflowCompanionServiceState.disconnected);
      }
    },
    [serviceConf],
  );
  return [clientState, serviceRef.current] as const;
}

async function multimodalTranslate(
  client: Client,
  files: Blob[],
  targetLang: string,
  model: string,
): Promise<TranslatedFile[]> {
  // const uploadRes = await client.upload_files(hfSpaceUrl, files)
  // files.forEach(file => formData.append('files[]', file));
  // debugLogger('Upload response:', uploadRes);
  const predictRes = await client.predict('/multimodal_llm_process_files', {
    gradio_temp_files: files, // uploadRes.files!.map(handle_file),
    model,
    target_language: targetLang,
    export_moeflow_project_name: 'Hello!!',
  });
  const [{ files: translated }] = predictRes.data as MoeflowMultimodalResData;

  debugLogger('Predict response:', translated);
  return translated;
}
export interface TranslatedFile {
  local_path: string;
  image_w: number;
  image_h: number;
  text_blocks: Array<{
    left: number;
    top: number;
    right: number;
    bottom: number;
    source: string;
    translated: string;
  }>;
}
/**
 * the type in gradio https://github.com/moeflow-com/manga-image-translator/blob/moeflow-companion-main/moeflow_companion/gradio/multimodal.py#L62
 */
type MoeflowMultimodalResData = [
  { files: TranslatedFile[] },
  /* the ignored packaged zip */ unknown,
];
