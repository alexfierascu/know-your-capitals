import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  // Only use base path in production build
  base: command === 'build' ? '/know-your-capitals/' : '/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist'
  },
  server: {
    open: true
  }
}));
