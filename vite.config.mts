import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { antdLessVars, antdLessVarsM } from './src/style';
import vitePluginImp from 'vite-plugin-imp';
import { visualizer } from 'rollup-plugin-visualizer';
import url from 'node:url';

const ___dirname = path.dirname(url.fileURLToPath(import.meta.url));
const componentsDir = path.join(___dirname, './src/components');

/**
 * origin to forward /api/ /storage/ requests to
 * note this server should rewrite /api/ /storage/ to the Python backend,
 * like the nginx conf in https://github.com/moeflow-com/moeflow-deploy .
 * Alternatively, configure vite's proxy to rewrite
 */
const backendOrigin = 'http://localhost:13080';

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
      process.env.MIT_BACKEND_URL ?? '/api/',
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
        // in local dev, proxy local moeflow-backend server for web app
        target: backendOrigin,
        changeOrigin: true,
      },
      '/storage/': {
        target: backendOrigin,
        changeOrigin: true,
      },
    },
  },
});
