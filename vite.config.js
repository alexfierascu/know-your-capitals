import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  // Only use base path in production build
  base: command === 'build' ? '/know-your-capitals/' : '/',
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
}));
