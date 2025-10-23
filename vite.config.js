import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Projektstamm
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './assets/JavaScript/main.ts',
      output: {
        entryFileNames: 'main.built.js',
        assetFileNames: 'main.built.[ext]',
      },
      inlineDynamicImports: true,
      manualChunks: undefined,
    },
  },
});