# Phase 0 — Foundation

**Goal:** an empty but complete monorepo where every rule from the ADRs is
enforced by tooling before the first feature is written.

**Exit criteria:** `pnpm build && pnpm test` passes on CI; lint blocks
forbidden imports; license check blocks non-allowed dependencies.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| P0-01 | Initialize repository and workspace | infra | S | — | doing |
| P0-02 | Turborepo task pipeline | infra | S | P0-01 | todo |
| P0-03 | Shared TypeScript and build presets | infra | S | P0-01 | todo |
| P0-04 | Scaffold all packages | infra | M | P0-03 | todo |
| P0-05 | Lint, format and environment-boundary rules | infra | M | P0-03, P0-04 | todo |
| P0-06 | Vitest setup | infra | S | P0-03 | todo |
| P0-07 | Changesets with fixed versioning | infra | S | P0-04 | todo |
| P0-08 | Dependency license check | infra | S | P0-01 | todo |
| P0-09 | CI workflow | infra | M | P0-02, P0-05, P0-06, P0-08 | todo |
| P0-10 | Playground app | infra | S | P0-04 | todo |
| P0-11 | CONTRIBUTING and PR template | docs | S | — | todo |
| P0-12 | Reserve npm scope and check trademark | infra | S | — | todo |
| P0-13 | ADR: error model and shared isomorphic code | adr | S | — | todo |

---

### P0-01 · Initialize repository and workspace
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** —
- **Refs:** [ADR 0002](../decisions/0002-monorepo-tooling.md)
- **Done when:**
  - [x] Git repository initialized, `.gitignore`, `.gitattributes`, commit convention and `commit-msg` hook.
  - [ ] `.editorconfig`.
  - [ ] Root `prepare` script runs `git config core.hooksPath .githooks`.
  - [ ] `.nvmrc` / `engines` pin Node.js LTS; `packageManager` pins pnpm.
  - [ ] `pnpm-workspace.yaml` includes `packages/*`, `apps/*`, `examples/*`, `tests/*`.

### P0-02 · Turborepo task pipeline
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-01
- **Refs:** [ADR 0002](../decisions/0002-monorepo-tooling.md)
- **Done when:**
  - [ ] `turbo.json` defines `build`, `typecheck`, `lint`, `test`, `dev` with correct `dependsOn` and outputs.
  - [ ] Root scripts `pnpm build|test|lint|typecheck` run through Turbo with caching.

### P0-03 · Shared TypeScript and build presets
- **Type:** infra · **Package:** `tooling/` · **Size:** S
- **Depends on:** P0-01
- **Refs:** [04 — conventions](../04-packages.md#naming-and-code-conventions)
- **Done when:**
  - [ ] Base `tsconfig` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
  - [ ] Separate presets for browser (DOM lib) and Node (no DOM lib) packages.
  - [ ] Shared `tsup` preset producing ESM + type declarations.

### P0-04 · Scaffold all packages
- **Type:** infra · **Package:** all · **Size:** M
- **Depends on:** P0-03
- **Refs:** [04 — layout](../04-packages.md#repository-layout), [ADR 0007](../decisions/0007-mit-license.md)
- **Done when:**
  - [ ] `core`, `schema`, `media`, `captions`, `transitions`, `player`, `bundler`, `renderer`, `cli` exist with `src/index.ts`, README, `"license": "MIT"`.
  - [ ] `@kairon/schema` exposes two entries: root and `/react`.
  - [ ] `react` is a peer dependency of browser packages (React 19).
  - [ ] Every package builds and exports one placeholder symbol with a test.

### P0-05 · Lint, format and environment-boundary rules
- **Type:** infra · **Package:** `tooling/` · **Size:** M
- **Depends on:** P0-03, P0-04
- **Refs:** [04 — environment boundaries](../04-packages.md#environment-boundaries)
- **Done when:**
  - [ ] ESLint + Prettier configured for all packages.
  - [ ] Lint fails if a browser package imports Node built-ins or a Node package.
  - [ ] Lint fails if `@kairon/schema` root entry imports React or DOM APIs.
  - [ ] Lint fails if the dependency graph from [04](../04-packages.md#dependency-graph) is violated.
  - [ ] Each rule has a failing fixture test.

### P0-06 · Vitest setup
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-03
- **Done when:**
  - [ ] Vitest workspace config; `jsdom` environment for browser packages, `node` for Node packages.
  - [ ] Coverage report generated in CI.

### P0-07 · Changesets with fixed versioning
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-04
- **Refs:** [ADR 0002](../decisions/0002-monorepo-tooling.md)
- **Done when:**
  - [ ] Changesets configured with all `@kairon/*` packages in one `fixed` group.
  - [ ] `pnpm changeset` documented in CONTRIBUTING.

### P0-08 · Dependency license check
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-01
- **Refs:** [ADR 0007](../decisions/0007-mit-license.md), [11](../11-legal-and-clean-room.md)
- **Done when:**
  - [ ] Script fails when any production dependency has a license outside MIT, ISC, BSD-2/3, Apache-2.0, 0BSD.
  - [ ] Exceptions require an entry in an allowlist file with a reason.

### P0-09 · CI workflow
- **Type:** infra · **Package:** `.github/` · **Size:** M
- **Depends on:** P0-02, P0-05, P0-06, P0-08
- **Done when:**
  - [ ] On every PR: install, lint, typecheck, test, build, license check.
  - [ ] pnpm store and Turbo cache are cached between runs.
  - [ ] Main branch protected: CI must pass.

### P0-10 · Playground app
- **Type:** infra · **Package:** `apps/playground` · **Size:** S
- **Depends on:** P0-04
- **Refs:** [ADR 0003](../decisions/0003-vite-as-bundler.md)
- **Done when:**
  - [ ] Vite + React 19 app that imports workspace packages with hot reload.

### P0-11 · CONTRIBUTING and PR template
- **Type:** docs · **Package:** root · **Size:** S
- **Depends on:** —
- **Refs:** [11](../11-legal-and-clean-room.md), [ADR 0010](../decisions/0010-own-api-vocabulary.md)
- **Done when:**
  - [ ] CONTRIBUTING explains setup, clean-room rules, naming policy, changesets (commit style already there).
  - [ ] PR template has: sources used (provenance), naming check, docs updated, tests added.

### P0-12 · Reserve npm scope and check trademark
- **Type:** infra · **Package:** — · **Size:** S
- **Depends on:** —
- **Refs:** [11 — trademark](../11-legal-and-clean-room.md#trademark)
- **Done when:**
  - [ ] `@kairon` npm organization created (or an alternative scope chosen and docs updated).
  - [ ] Trademark search for "Kairon" in software classes done; result noted.

### P0-13 · ADR: error model and shared isomorphic code
- **Type:** adr · **Package:** — · **Size:** S
- **Depends on:** —
- **Refs:** [09 — errors](../09-api-design.md#errors), [04](../04-packages.md)
- **Why now:** `KaironError` is needed by `schema` (anywhere), `core` (browser) and `renderer` (Node). The docs do not say where it lives.
- **Decide:**
  - Where shared isomorphic code lives: inside `@kairon/schema` root, or a new small `@kairon/shared` package.
  - `KaironError` shape, code naming (`KAIRON_E_<AREA>_<NAME>`), warnings vs errors.
  - Where the error code catalog is defined so docs can be generated from it.
- **Done when:**
  - [ ] ADR accepted; [04](../04-packages.md) and [09](../09-api-design.md) updated.
