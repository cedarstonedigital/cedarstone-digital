import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built output lands in the folder GitHub Pages serves:
//   cedarstone-architecture/index.html + cedarstone-architecture/build/*
// Source stays in cedarstone-architecture/app.
export default defineConfig({
  base: '/cedarstone-architecture/',
  plugins: [react()],
  build: {
    outDir: '..',
    assetsDir: 'build',
    emptyOutDir: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          gsap: ['gsap']
        }
      }
    }
  }
});
