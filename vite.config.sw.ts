import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const revision = execSync('git rev-parse HEAD').toString().trim().slice(0, 7);

export default defineConfig(() => ({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/service-worker/index.ts'),
      name: 'sw',
      fileName: () => 'sw.js',
      formats: ['iife'],
    },
    outDir: 'wwwroot',
    sourcemap: true,
  },
  define: {
    VITE_REVISION: JSON.stringify(revision),
  },
}));
