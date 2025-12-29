import { defineConfig } from 'vite';

export default defineConfig({
  base: '/know-your-capitals/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    open: true
  }
});
