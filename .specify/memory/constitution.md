<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: none
- Added sections: Security & Data Handling Constraints; Informed Decision Process; Git Workflow; Post-Task Learning Capture
- Removed sections: none
- Templates requiring updates: ⚠ .specify/templates/plan-template.md; ⚠ .specify/templates/spec-template.md; ⚠ .specify/templates/tasks-template.md (re-sync gates if needed)
- Follow-up TODOs: none
-->

# Apple Notes Extractor Constitution

## Core Principles

### Local-First Privacy Preservation

User content stays on the machine. The extractor must not send note data or metadata
to third-party services. Access only the minimum required permissions, store exports
in user-controlled locations, and provide a clear way to purge artifacts.

### Deterministic Export Contracts

Exports must be reproducible: identical inputs yield identical outputs (path,
structure, ordering, and checksums). Capture source identifiers, timestamps, and
attachment references alongside transformed content so results can be traced back
without re-reading the source.

### Test-First Data Handling

Test-first is mandatory. Write fixtures and tests that cover parsing, conversion,
and error paths before implementation. Follow red-green-refactor. Protect private
data: fixtures must be synthetic or sanitized.

### CLI-First Automation

The CLI is the primary interface. It must support both human-readable and JSON
outputs, include dry-run and selective export options, and emit machine-friendly
exit codes. Behavior must be scriptable and documented via `--help`.

### Observability and Failure Transparency

Use structured logging with note identifiers to trace failures without leaking
sensitive content. Surface partial failures explicitly, avoid silent drops, and
provide enough context to reproduce or resume an export.

## Security & Data Handling Constraints

- Offline-first: network access is disallowed during extraction unless explicitly
  justified and configurable.
- Least privilege: only request access to the Notes database and target output
  location; do not persist credentials or tokens.
- Data hygiene: exports must avoid embedding secrets or system paths; scrub or
  redact sensitive fields in logs.
- Storage discipline: document where artifacts are written, their formats, and how
  to remove them.

## Development Workflow & Quality Gates

- Tests precede implementation; new behavior requires failing tests before code.
- CLI contract tests must cover text and JSON output, exit codes, and dry-run
  behavior.
- Determinism checks: include a repeatability test to ensure the same inputs
  produce byte-for-byte identical outputs.
- Logging and observability are part of definition of done; errors must reference
  note identifiers or paths without exposing content.
- Releases follow semantic versioning tied to export format compatibility; breaking
  changes require migration notes and a major version bump.

## Informed Decision Process

- Gather evidence before acting: consult code, specs, docs, and repo templates
  prior to proposing changes.
- When uncertain, continue researching and ask for user clarification rather than
  guessing.
- Seek second opinions in available resources to confirm or disprove assumptions.

## Git Workflow

- Use git flow for feature and fix branches (e.g., `feature/###-...`, `fix/###-...`)
  and keep work scoped to the branch.
- Follow Conventional Commits for all commits (e.g., `feat: ...`, `fix: ...`,
  `docs: ...`).

## Post-Task Learning Capture

- After completing work, reflect on surprises and newly learned specifics.
- Distill lessons into a concise, project-aligned note or doc update with clear
  references to where the knowledge came from.
- Prefer actionable, crisp guidance that can be reused on future tasks.

## Governance

- This constitution supersedes other guidelines for Apple Notes Extractor. Any
  deviation must be justified in writing and approved in review.
- Amendments require updating this document, the Sync Impact Report, and dependent
  templates. Track changes with semantic versioning (major for incompatible policy
  shifts, minor for new principles/sections, patch for clarifications).
- Compliance is checked in PR reviews and pre-release checklists. If violations are
  unavoidable, record the rationale and the mitigation plan before merging.

**Version**: 1.1.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2025-11-24
