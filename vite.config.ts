import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api calls proxy to the Express server (npm start) in dev and preview modes.
const api = { target: 'http://127.0.0.1:3000', changeOrigin: true };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: '127.0.0.1', proxy: { '/api': api } },
  preview: { port: 4173, host: '127.0.0.1', proxy: { '/api': api } },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
