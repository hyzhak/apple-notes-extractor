# Research Findings

- Decision: Use Node.js 24.x LTS (24.11.1 per nodejs.org/about/previous-releases on 2025-11-25) with TypeScript 5.x (ESM) and bundle via tsup for the CLI bin and library entry.

  - Rationale: 24.x is the active LTS (current latest is 25.x but non-LTS); LTS offers stability for CI/npm consumers while tsup (esbuild under the hood) produces fast, small bundles and can emit both ESM/CJS.
  - Alternatives considered: Node 25 (latest, non-LTS with churn risk), ts-node (no bundle, slower startup), swc (fast but extra config), pure tsc (slower, larger outputs).

- Decision: CLI surface built on commander with zod validation of parsed options, plus structured logging helpers.

  - Rationale: Commander is battle-tested for option parsing, help, and subcommands; zod gives concise runtime validation and schema reuse for JSON outputs/tests.
  - Alternatives considered: yargs (heavier API), oclif (framework overhead for simple single-command CLI), custom parsing (higher maintenance).

- Decision: Testing with vitest (unit, contract, integration) using synthetic fixture notes and snapshot/determinism checks.

  - Rationale: Vitest is fast, TS-native, and supports snapshot/testing of stdout/stderr; aligns with determinism gates and red-green workflow.
  - Alternatives considered: Jest (heavier), Mocha (more wiring), tap (less TS DX).

- Decision: Use `@jxa/run` to drive AppleScript/JXA access to the Notes app, wrapped with typed helpers and deterministic traversal.

  - Rationale: `@jxa/run` gives a minimal bridge to Notes without extra native bindings, keeping the package JS-only and npm-friendly for CI/publish; allows deterministic querying and offline operation.
  - Alternatives considered: direct `osascript` shell calls (harder to type/maintain), native bindings (heavier, less portable), Electron automation (overkill).

- Decision: NPM package/publish pipeline via GitHub Actions: on tag `v*`, run lint/tests/build, then `npm publish` using `NODE_AUTH_TOKEN`; dry-run job optional for PRs.

  - Rationale: Tag-driven releases align with SemVer and npm; keeps extraction offline while CI/publish uses only build artifacts; secrets scoped to publish step.
  - Alternatives considered: Manual `npm publish` (error-prone), changesets workflow (overkill for single-package initial release), pushing from local (less reproducible).

- Decision: Deterministic export strategy: stable sort by folder path then note id; sanitized filenames via deterministic slug; `index.json` as ordered array; progress updates on batch cadence without leaking content.
  - Rationale: Satisfies constitution determinism gate and spec requirement for repeatable exports; batching progress avoids silent runs while staying concise.
  - Alternatives considered: Unordered traversal (non-deterministic), verbose per-note logging (noisy, potential leakage).
