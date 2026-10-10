import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = process.env;
    
    // Determine environment from Cloudflare Pages build or local mode
    const cfPagesBuild = env.CF_PAGES_BUILD; // Set to 'true' on Cloudflare Pages
    const cfPagesBranch = env.CF_PAGES_BRANCH; // 'main', 'dev', 'test', etc.
    const nodeEnv = env.NODE_ENV || 'development';
    
    // Environment detection
    const isProduction = cfPagesBranch === 'main' || nodeEnv === 'production';
    const isDev = mode === 'development' || !isProduction;
    
    return {
      server: {
        port: 5173,
        host: true,
        strictPort: false,
      },
      build: {
        target: 'es2015',
        sourcemap: isDev,
        minify: !isDev,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            },
          },
        },
      },
      plugins: [
        dyadComponentTagger(),
        react(),
      ],
      envDir: '.',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.IS_LOCAL': JSON.stringify(!isProduction),
        'process.env.IS_DEV': JSON.stringify(isDev),
        'process.env.IS_PRODUCTION': JSON.stringify(isProduction),
        'process.env.CF_PAGES_BUILD': JSON.stringify(!!cfPagesBuild),
        'process.env.CF_PAGES_BRANCH': JSON.stringify(cfPagesBranch || ''),
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
