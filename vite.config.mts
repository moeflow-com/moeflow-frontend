import { defineConfig, ProxyOptions, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { antdLessVars, antdLessVarsM } from './src/style';
import vitePluginImp from 'vite-plugin-imp';
import { visualizer } from 'rollup-plugin-visualizer';
import url from 'node:url';

const ___dirname = path.dirname(url.fileURLToPath(import.meta.url));
const componentsDir = path.join(___dirname, './src/components');

/**
 * Develop with a bare Python API server
 */
const bareBackendProxy: ProxyOptions = {
  target: 'http://localhost:5000',
  changeOrigin: true,
  rewrite(clientReqPath: string) {
    const toStripe = /^\/(api)/;
    const rewritten = clientReqPath.replace(toStripe, '');
    // console.debug('rewrite', clientReqPath, rewritten);
    return rewritten;
  },
};

/**
 * Develop with server that handles /api/ /storage/ URL rewrites.
 * e.g. a nginx configured like https://github.com/moeflow-com/moeflow-deploy .
 */
const rewriteBackendProxy: ProxyOptions = {
  target: 'http://localhost:80',
  changeOrigin: true,
};

const apiProxy = bareBackendProxy;

// https://vitejs.dev/config/
export default defineConfig({
  // root: 'src',
  build: {
    sourcemap: true,
    outDir: path.join(__dirname, './build'),
    emptyOutDir: true,
    rollupOptions: {
      // external: ['lodash', 'lodash/default'],
      output: {
        manualChunks(id, meta) {
          if (id.includes(componentsDir)) {
            return 'moeflow-components';
          } else if (id.includes('antd')) {
            return 'vendor-antd';
          }
          return null;
        },
      },
    },
  },
  define: {
    'process.env.REACT_APP_BASE_URL': JSON.stringify(
      process.env.REACT_APP_BASE_URL ?? '/api/',
    ),
    // works as feature flag
    'process.env.MIT_BACKEND_URL': JSON.stringify(
      process.env.MIT_BACKEND_URL ?? (null && '/api/'),
    ),
  },
  resolve: {
    alias: {},
  },
  plugins: [
    vitePluginImp({
      libList: [
        {
          // antd 按需导入
          libName: 'antd',
          style: (name) => `antd/es/${name}/style`,
        },
        {
          // antd-mobile 按需导入
          libName: 'antd-mobile',
          style: (name) => `antd-mobile/es/${name}/style`,
        },
      ],
    }),
    react({
      jsxImportSource: '@emotion/core',
    }),
    visualizer({}),
    splitVendorChunkPlugin(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        // 覆盖 antd 的 Less 样式
        javascriptEnabled: true,
        modifyVars: {
          ...antdLessVars,
          ...antdLessVarsM,
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/': {
        ...apiProxy,
      },
      // '/storage/': { ...apiProxy, },
    },
  },
});
