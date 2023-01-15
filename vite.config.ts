import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import { execSync } from 'child_process';

const revision = execSync('git rev-parse HEAD').toString().trim().slice(0, 7);

export default defineConfig(({ mode }) => ({
  appType: 'spa',
  build: {
    assetsDir: '.',
    manifest: true,
    outDir: 'wwwroot',
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  },
  define: {
    VITE_REVISION: JSON.stringify(revision),
  },
  plugins: [
    preact({
      devtoolsInProd: true,
      babel: {
        plugins: mode === 'development' ? ['@babel/plugin-transform-react-jsx-source'] : [],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/resources/app.json',
          dest: '.',
        },
        {
          src: 'src/resources/robots.txt',
          dest: '.',
        },
        {
          src: 'src/resources/images/*.png',
          dest: '.',
        },
      ],
    }),
    visualizer(),
  ],
  server: {
    open: true,
    port: 8000,
    strictPort: true,
  },
  test: {
    deps: {
      interopDefault: true,
    },
    globals: true,
    coverage: {
      all: true,
      reporter: ['text', 'lcov'],
      src: ['src'],
    },
  },
}));
