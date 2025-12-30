import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Only use base path in production build
  base: command === 'build' ? '/know-your-capitals/' : '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/app-check']
        }
      }
    }
  },
  server: {
    open: true
  }
}));
