# Phase 0 — Foundation

**Goal:** an empty but complete monorepo where every rule from the ADRs is
enforced by tooling before the first feature is written.

**Exit criteria:** `pnpm build && pnpm test` passes on CI; lint blocks
forbidden imports; license check blocks non-allowed dependencies.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| P0-01 | Initialize repository and workspace | infra | S | — | done |
| P0-02 | Turborepo task pipeline | infra | S | P0-01 | done |
| P0-03 | Shared TypeScript and build presets | infra | S | P0-01 | done |
| P0-04 | Scaffold all packages | infra | M | P0-03 | done |
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
  - [x] `.editorconfig`.
  - [x] Root `prepare` script runs `git config core.hooksPath .githooks`.
  - [x] `.nvmrc` / `engines` pin Node.js LTS; `packageManager` pins pnpm.
  - [x] `pnpm-workspace.yaml` includes `packages/*`, `apps/*`, `examples/*`, `tests/*`.

### P0-02 · Turborepo task pipeline
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-01
- **Refs:** [ADR 0002](../decisions/0002-monorepo-tooling.md)
- **Done when:**
  - [x] `turbo.json` defines `build`, `typecheck`, `lint`, `test`, `dev` with correct `dependsOn` and outputs.
  - [x] Root scripts `pnpm build|test|lint|typecheck` run through Turbo with caching.
  - Verified with two throwaway packages (not committed): topological order (`^build` built the dependency before its consumer), content-based cache (full re-run → `FULL TURBO`, ~5.4s → 34ms), and cache invalidation on a source edit (`inputs`). `dev` is `cache: false, persistent: true` and has no real task to run yet (added in P0-10/P0-04).

### P0-03 · Shared TypeScript and build presets
- **Type:** infra · **Package:** `tooling/` · **Size:** S
- **Depends on:** P0-01
- **Refs:** [04 — conventions](../04-packages.md#naming-and-code-conventions)
- **Done when:**
  - [x] Base `tsconfig` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
  - [x] Separate presets for browser (DOM lib) and Node (no DOM lib) packages.
  - [x] Shared `tsup` preset producing ESM + type declarations.
  - Verified with a throwaway package built against each preset (not committed): `noUncheckedIndexedAccess` catches an unguarded index, the Node preset has no DOM lib, the browser preset compiles JSX against a `react` peer, and `tsup` + `@kairon/tsup-config` emit ESM and a `.d.ts`. Pinned `typescript` to `5.9.3` because `tsup`'s declaration bundler is not yet compatible with `typescript@7` (see [tooling/README.md](../../tooling/README.md)).

### P0-04 · Scaffold all packages
- **Type:** infra · **Package:** all · **Size:** M
- **Depends on:** P0-03
- **Refs:** [04 — layout](../04-packages.md#repository-layout), [ADR 0007](../decisions/0007-mit-license.md)
- **Done when:**
  - [x] `core`, `schema`, `media`, `captions`, `transitions`, `player`, `bundler`, `renderer`, `cli` exist with `src/index.(ts|tsx)`, README, `"license": "MIT"`.
  - [x] `@kairon/schema` exposes two entries: root (`tsconfig.json`, no DOM lib) and `/react` (`tsconfig.react.json`, DOM + JSX); both type-check and build (`tsconfig.build.json` for bundling only).
  - [x] `react` is a peer dependency of browser packages (`core`, `media`, `captions`, `transitions`, `player`) and an optional peer of `schema` (only its `/react` entry needs it).
  - [x] Every package builds, type-checks and exports one placeholder with a passing test (`pnpm build|typecheck|test` all green across all 9 packages). Browser placeholders return a typed `ReactElement`, proving DOM + JSX; Node placeholders call `node:os`, proving the Node lib; `schema`'s root placeholder is a plain constant, proving no DOM/Node leak into the isomorphic entry.
  - Pinned `typescript@5.9.3` (not `7.x`, see [tooling/README.md](../../tooling/README.md)) also fixed `tsup`'s dts build for all packages. Fixed `kaironPreset`'s default entry glob (`src/index.{ts,tsx}`) to match `.tsx` placeholder sources — it previously only matched `.ts`.

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
