import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ['src/**/*.ts', 'tests/**/*.ts'],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      project: ['./tsconfig.src.json', './tsconfig.tests.json'],
      tsconfigRootDir: import.meta.dirname
    }
  }
}));

const toolingConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['*.config.ts', 'scripts/**/*.ts', 'tsup.config.ts', 'vitest.config.ts'],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      project: false
    }
  }
}));

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'notes/**',
      '*.tsbuildinfo',
      '*.log',
      'tmp/**',
      '.specify/**',
      '.venv/**',
      'artifacts/**',
      'log/**',
      'scripts/probes/**'
    ]
  },
  js.configs.recommended,
  ...typeCheckedConfigs,
  ...toolingConfigs,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  prettier
);
