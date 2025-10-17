import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Projektstamm
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './assets/JavaScript/main.js',
      output: {
        entryFileNames: 'main.bundle.js',
      },
      inlineDynamicImports: true,
      manualChunks: undefined,
    },
  },
});