import debugModule from 'debug';

export function createDebugLogger(namespace: string) {
  return debugModule(`moeflow:${namespace}`);
}
