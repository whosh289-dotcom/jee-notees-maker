import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const mergedEnv = {...process.env, ...env};
  
  const defineEnv: Record<string, string> = {};
  Object.keys(mergedEnv).forEach(key => {
    if (key.includes('KEY') || key.includes('GEMINI') || key.includes('GOOGLE')) {
      defineEnv[`process.env.${key}`] = JSON.stringify(mergedEnv[key]);
    }
  });
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      ...defineEnv,
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
