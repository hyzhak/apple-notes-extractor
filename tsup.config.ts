import { defineConfig } from 'tsup';

const common = {
  format: ['esm'] as const,
  minify: false,
  sourcemap: true,
  splitting: false,
  skipNodeModulesBundle: true,
  target: 'node24',
  platform: 'node' as const,
  tsconfig: './tsconfig.tsup.json'
};

export default defineConfig([
  {
    ...common,
    entry: { cli: 'src/cli/index.ts' },
    dts: false,
    clean: true,
    banner: {
      js: '#!/usr/bin/env node'
    },
    outDir: 'dist'
  },
  {
    ...common,
    entry: { index: 'src/index.ts' },
    dts: { entry: ['src/index.ts'], tsconfig: './tsconfig.tsup.json' },
    clean: false,
    outDir: 'dist'
  }
]);
