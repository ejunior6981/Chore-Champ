import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = process.env;
    
    return {
      server: {
        port: 3000,
        host: 'localhost',
        strictPort: true,
      },
      build: {
        target: 'esnext',
        sourcemap: true,
      },
      plugins: [
        dyadComponentTagger(),
        react(),
      ],
      envDir: '.',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.IS_LOCAL': JSON.stringify(true),
      },
      resolve: {
        alias: {
          '@': join(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
    };
});
