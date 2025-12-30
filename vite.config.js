import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Only use base path in production build
  base: command === 'build' ? '/know-your-capitals/' : '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Enable minification
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    rollupOptions: {
      output: {
        // Split Firebase into separate chunks for lazy loading
        manualChunks(id) {
          if (id.includes('firebase/app')) {
            return 'firebase-app';
          }
          if (id.includes('firebase/auth')) {
            return 'firebase-auth';
          }
          if (id.includes('firebase/firestore')) {
            return 'firebase-firestore';
          }
          if (id.includes('i18next')) {
            return 'i18next';
          }
        }
      }
    },
    // Ensure CSS is extracted and can be loaded efficiently
    cssCodeSplit: true,
    // CSS minification
    cssMinify: true
  },
  server: {
    open: true
  }
}));
