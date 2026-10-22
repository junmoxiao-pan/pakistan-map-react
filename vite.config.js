import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' 让 dist 产物可直接 file:// 打开
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, open: true },
});
