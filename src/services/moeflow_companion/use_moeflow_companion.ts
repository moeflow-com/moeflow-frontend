import { useState, useRef } from 'react';
import { Client } from '@gradio/client';
import { useAsyncEffect } from '@jokester/ts-commonutil/lib/react/hook/use-async-effect';
import { useSelector } from 'react-redux';
import { AppState } from '@/store';
import { createDebugLogger } from '@/utils/debug-logger';

export const moeflowCompanionServiceState = {
  disabled: 'disabled',
  connecting: 'connecting',
  connected: 'connected',
  disconnected: 'disconnected',
} as const;

const logger = createDebugLogger('service:moeflow_companion');

export function useMoeflowCompanion() {
  const clientRef = useRef<Client | null>(null);
  const [clientState, setClientState] = useState<string>(
    moeflowCompanionServiceState.disabled,
  );
  const serviceConf = useSelector(
    (s: AppState) => s.site.runtimeConfig.moeflowCompanion,
  );

  useAsyncEffect(
    async (_, released) => {
      if (!serviceConf?.gradioUrl) {
        clientRef.current = null;
        setClientState(moeflowCompanionServiceState.disabled);
        return;
      }
      try {
        const client = await Client.connect(serviceConf.gradioUrl);
        clientRef.current = client;
        setClientState(moeflowCompanionServiceState.connected);
        released.then(() => client.close());
      } catch (e) {
        logger('error connecting', e, serviceConf.gradioUrl);
        clientRef.current = null;
        setClientState(moeflowCompanionServiceState.disconnected);
      }
    },
    [serviceConf],
  );
  return [clientState, clientRef.current] as const;
}

export async function x(client: Client) {}
