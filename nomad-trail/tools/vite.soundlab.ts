import { defineConfig } from 'vite';
import path from 'node:path';
/* The Sound Lab player: one IIFE for the review hub, sharing src/audio with the game. */
export default defineConfig({
  base: '/trail/', publicDir: false,
  build: { outDir: path.resolve(__dirname, '../../trail/review'), emptyOutDir: false, target: 'es2020', minify: true,
    lib: { entry: path.resolve(__dirname, 'soundlab-entry.ts'), name: 'soundlab', formats: ['iife'], fileName: () => 'soundlab.js' } },
});
