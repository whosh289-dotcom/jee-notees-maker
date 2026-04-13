import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Merge with process.env to ensure system secrets are captured
  const mergedEnv = {...process.env, ...env};
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(mergedEnv.GEMINI_API_KEY || mergedEnv.VITE_GEMINI_API_KEY || ""),
      'process.env.GOOGLE_API_KEY': JSON.stringify(mergedEnv.GOOGLE_API_KEY || mergedEnv.VITE_GOOGLE_API_KEY || ""),
      'process.env.API_KEY': JSON.stringify(mergedEnv.API_KEY || mergedEnv.VITE_API_KEY || ""),
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
