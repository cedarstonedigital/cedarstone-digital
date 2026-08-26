import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Single-file build used for the shareable preview: one JS bundle, one CSS
   file, no code splitting, so the whole site can be inlined into one page. */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'artifact-dist',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 4000,
    rollupOptions: { output: { inlineDynamicImports: true, manualChunks: undefined } }
  }
});
