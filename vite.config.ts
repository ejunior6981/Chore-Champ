import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [dyadComponentTagger(), react(), nitro()],
      define: {
        // API keys should never be exposed client-side. Remove these lines.
        // If API calls are needed, implement a backend proxy layer.
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // PWA build optimizations
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            }
          }
        },
        copyPublicDir: true,
        // Ensure service worker is copied
        outDir: 'dist',
        assetsDir: 'assets'
      }
    };
});
