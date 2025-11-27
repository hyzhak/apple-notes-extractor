# apple-notes-extractor Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-25

## Active Technologies

- TypeScript 5.x on Node.js 25.x (ESM) + commander (CLI), tsup (bundle), zod (arg/JSON schema validation), @jxa/run (AppleScript/JXA bridge to Notes), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format) (001-apple-notes-export)
- Local filesystem outputs only (`index.json`, `notes/`, `artifacts/`), no external services (001-apple-notes-export)
- TypeScript 5.x on Node.js 24.x LTS (ESM) + commander (CLI), tsup (bundle), zod (arg/JSON schema validation), @jxa/run (AppleScript/JXA bridge to Notes), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format) (001-apple-notes-export)

- TypeScript 5.x on Node.js 20 LTS (ESM) + commander (CLI), tsup (bundle), zod (arg/JSON schema validation), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format) (001-apple-notes-export)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x on Node.js 20 LTS (ESM): Follow standard conventions

## Recent Changes

- 001-apple-notes-export: Added TypeScript 5.x on Node.js 24.x LTS (ESM) + commander (CLI), tsup (bundle), zod (arg/JSON schema validation), @jxa/run (AppleScript/JXA bridge to Notes), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format)
- 001-apple-notes-export: Added TypeScript 5.x on Node.js 25.x (ESM) + commander (CLI), tsup (bundle), zod (arg/JSON schema validation), @jxa/run (AppleScript/JXA bridge to Notes), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format)

- 001-apple-notes-export: Added TypeScript 5.x on Node.js 20 LTS (ESM) + commander (CLI), tsup (bundle), zod (arg/JSON schema validation), zx or fs/promises for filesystem, vitest (tests), eslint/prettier (lint/format)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
