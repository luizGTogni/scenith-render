# 0002 — Monorepo with pnpm, Turborepo and TypeScript

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Kairon has several packages that change together (core, player, renderer)
and must share one version.

## Decision

- **pnpm workspaces** for package management.
- **Turborepo** for task orchestration and caching.
- **TypeScript** in strict mode for all code; packages build with `tsup`.
- **Vitest** for unit tests, **Changesets** for versioning with all
  `@kairon/*` packages released at the same version.
- Node.js LTS as the minimum runtime; React 19 as the peer dependency.

## Alternatives considered

- **Nx** — more powerful but heavier and more opinionated.
- **Separate repositories** — version drift and slower cross-package changes.

## Consequences

- + One PR can change core and renderer together.
- + Fast, cached CI.
- − Contributors need pnpm.
