import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

export default defineConfig(({ mode }) => {
    const env = process.env;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: 'vite',
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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': process.cwd(),
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
    };
});
