import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.PROTALK_BOT_TOKEN': JSON.stringify(env.PROTALK_BOT_TOKEN),
        'process.env.PROTALK_BOT_ID': JSON.stringify(env.PROTALK_BOT_ID),
        'process.env.PROTALK_API_URL': JSON.stringify(env.PROTALK_API_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

