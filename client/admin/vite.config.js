import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: { port: 3001, proxy: { '/api': 'http://localhost:10000', '/health': 'http://localhost:10000' } },
  build: { outDir: 'build', sourcemap: false },
});
