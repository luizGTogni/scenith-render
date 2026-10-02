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
| P0-05 | Lint, format and environment-boundary rules | infra | M | P0-03, P0-04 | done |
| P0-06 | Vitest setup | infra | S | P0-03 | done |
| P0-07 | Changesets with fixed versioning | infra | S | P0-04 | done |
| P0-08 | Dependency license check | infra | S | P0-01 | done |
| P0-09 | CI workflow | infra | M | P0-02, P0-05, P0-06, P0-08 | done |
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
  - [x] ESLint + Prettier configured for all packages. `tooling/eslint`
    (`@kairon/eslint-config`) exports `kaironConfig({ package, environment,
    allowedInternalDeps, tsconfigRootDir, files?, project? })`; every package
    (the 9 product packages + the `tooling/*` packages themselves) has its
    own tiny `eslint.config.js` calling it, plus `eslint` and
    `@kairon/eslint-config` as direct devDependencies (pnpm doesn't hoist
    binaries, same reason as `tsup` in P0-03/04) and a `"lint": "eslint ."`
    script. Prettier is configured once at the root (`.prettierrc.json`,
    `format` / `format:check` scripts) since it needs no per-package
    parameterization.
  - [x] Lint fails if a browser package imports Node built-ins or a Node
    package — `no-restricted-imports` over `node:module`'s `builtinModules`
    (both bare and `node:`-prefixed forms), for every environment except
    `"node"`.
  - [x] Lint fails if `@kairon/schema` root entry imports React or DOM APIs —
    the `"isomorphic"` environment forbids `react`/`react-dom`/`react/jsx-runtime`
    imports and browser globals (`window`, `document`, ...) via
    `no-restricted-globals`; `@kairon/schema`'s `eslint.config.js` calls
    `kaironConfig` twice (once per entry, each with its own `files` +
    `project`), since its two entries need different rules in the same package.
  - [x] Lint fails if the dependency graph from
    [04](../04-packages.md#dependency-graph) is violated — `kaironConfig`
    computes `all @kairon/* packages − self − allowedInternalDeps` and feeds
    it to `no-restricted-imports`, so every package only has to state what it
    *is* allowed to import.
  - [x] Each rule has a failing fixture test —
    `tooling/eslint/index.test.js` runs `kaironConfig`'s output through
    ESLint's `Linter` class against real package tsconfigs (no mocking): one
    test per rule, plus one proving an *allowed* import is not flagged.
    `pnpm --filter @kairon/eslint-config test` → 5/5 passing.
  - Verified end-to-end: `pnpm build && pnpm typecheck && pnpm lint && pnpm test`
    all green (12 packages lint, 10 packages test, including
    `@kairon/eslint-config` itself).
  - Two real bugs found and fixed while wiring this up: (1) `eslint-plugin-react`
    does not support ESLint 10 yet (peer range caps at `^9.7`) — dropped it,
    kept only `eslint-plugin-react-hooks` (which does support 10) for
    `rules-of-hooks`/`exhaustive-deps`. (2) Prettier's markdown printer treats
    a leading `+`/`-` after a bullet as a *nested* list marker and rewrites
    `- + pro` to `- - pro`, corrupting every ADR's pros/cons list — `*.md` is
    now excluded in `.prettierignore` until that convention changes.

### P0-06 · Vitest setup
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-03
- **Done when:**
  - [x] Vitest workspace config; `jsdom` environment for browser packages,
    `node` for Node packages. The environment split was already in place per
    package since P0-04 (each package's own `vitest.config.(js|ts)`); what
    this task adds is the root [`vitest.config.ts`](../../vitest.config.ts),
    which aggregates every package (`test.projects: ["packages/*",
    "tooling/eslint"]`) into one process. `tooling/typescript` and
    `tooling/tsup` have no tests and are left out.
  - [x] Coverage report generated in CI — `@vitest/coverage-v8` (v8
    provider), `pnpm test:coverage` (`vitest run --coverage`, text + html +
    lcov). This is a **separate** script from `pnpm test` (which still goes
    through Turborepo, per-package, cached, uninstrumented) because Vitest's
    coverage/reporting options are workspace-level — they only take effect
    from the config that owns `projects` — and coverage instrumentation has
    a real cost that shouldn't slow down the everyday `pnpm test` loop. CI
    wiring (uploading the report) is P0-09.
  - Verified: `pnpm test:coverage` → 11 test files, 15 tests, 100% coverage
    (31/31 statements) — expected, since all source is still placeholders.
  - One real issue found: under `--coverage`, three of
    `@kairon/eslint-config`'s fixture tests (P0-05) — the ones that spin up a
    real TypeScript program via `projectService`/`project` — exceeded
    Vitest's default 5 s timeout (coverage instrumentation slows anything
    touching the TypeScript compiler). Fixed with a package-level
    `testTimeout: 20_000` in `tooling/eslint/vitest.config.js`; the tests
    themselves were correct, just slow under instrumentation.

### P0-07 · Changesets with fixed versioning
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-04
- **Refs:** [ADR 0002](../decisions/0002-monorepo-tooling.md)
- **Done when:**
  - [x] Changesets configured with all `@kairon/*` packages in one `fixed`
    group — [.changeset/config.json](../../.changeset/config.json) lists the
    9 product packages explicitly (not a `@kairon/*` glob, which would also
    match the private `tooling/*` packages); those 3 are listed in `ignore`
    instead, since Changesets would otherwise try to version them too.
  - [x] `pnpm changeset` documented in CONTRIBUTING — new "Versioning
    (Changesets)" section in [CONTRIBUTING.md](../../CONTRIBUTING.md).
  - Verified with a throwaway changeset (not committed): `pnpm changeset
    version` bumped all 9 product packages from `0.0.0` to `0.0.1` together
    and generated a `CHANGELOG.md` for each, while the 3 `tooling/*`
    packages stayed untouched. Then reverted (`git checkout` the
    `package.json`s, removed the generated changelogs) — this task adds no
    version bumps, just the configuration.
  - `pnpm changeset:version` / `pnpm changeset publish` are wired for later:
    the actual release run is built in [P6-07](phase-6-release.md).

### P0-08 · Dependency license check
- **Type:** infra · **Package:** root · **Size:** S
- **Depends on:** P0-01
- **Refs:** [ADR 0007](../decisions/0007-mit-license.md), [11](../11-legal-and-clean-room.md)
- **Done when:**
  - [x] Script fails when any production dependency has a license outside
    MIT, ISC, BSD-2/3, Apache-2.0, 0BSD —
    [scripts/check-licenses.mjs](../../scripts/check-licenses.mjs) (`pnpm
    check-licenses`) runs `pnpm licenses list --prod --json` (no extra
    dependency needed) and checks every reported license. Scope is
    production dependencies only, workspace-wide (including `tooling/*`'s
    own real dependencies, e.g. `@kairon/eslint-config`'s) — devDependencies
    never ship in a published `@kairon/*` package, so they're out of scope.
  - [x] Exceptions require an entry in an allowlist file with a reason —
    [license-allowlist.json](../../license-allowlist.json). Each entry's
    declared `license` is cross-checked against what is actually installed,
    so a stale entry (dependency removed, or its license changed) fails as
    an "unused exception" instead of silently staying valid.
  - Verified with a throwaway script against three scenarios (not committed):
    a genuinely unused/stale exception, real violations with no exceptions,
    and an exception with the wrong `license` recorded (correctly reported
    as both a new violation *and* a stale exception). All three failed with
    exit 1 and a clear message; the real allowlist passes with exit 0.
  - Two real, legitimate exceptions found scanning the current dependency
    tree and documented in the allowlist: `minimatch` (BlueOak-1.0.0, a
    modern permissive license) and `caniuse-lite` (CC-BY-4.0, browser
    compatibility *data*, not code, pulled in by Browserslist — attribution
    only, satisfied by keeping the package's license file intact).

### P0-09 · CI workflow
- **Type:** infra · **Package:** `.github/` · **Size:** M
- **Depends on:** P0-02, P0-05, P0-06, P0-08
- **Done when:**
  - [x] On every PR: install, lint, typecheck, test, build, license check —
    [.github/workflows/ci.yml](../../.github/workflows/ci.yml). Also runs
    `format:check` and `test:coverage` (uploaded as an artifact), fulfilling
    the "generated in CI" half of P0-06 that was deferred here.
  - [x] pnpm store and Turbo cache are cached between runs —
    `pnpm/setup@v3`'s `cache: true` handles the pnpm store; `actions/cache`
    handles Turborepo's local `.turbo` cache (no remote cache is configured,
    so this is what makes CI reuse results across runs, not just within one).
  - [x] Main branch protected: CI must pass — the repo is now pushed to
    [github.com/luizGTogni/kairon-render](https://github.com/luizGTogni/kairon-render)
    (public); the `CI` workflow ran for real on push (1m11s, all green:
    https://github.com/luizGTogni/kairon-render/actions/runs/36948468240).
    Branch protection on `main` set via `gh api .../branches/main/protection`:
    required status check `lint, typecheck, test, build, license check`
    (strict — branch must be up to date), `enforce_admins: true`, force
    pushes and deletions disabled. Verified by reading the protection back.
  - Verified locally, running the exact sequence from the workflow
    (`pnpm install --frozen-lockfile` through `pnpm test:coverage`, from a
    cleared `.turbo` cache): all green. Then confirmed for real on GitHub
    (see above) — not just locally.
  - Workflow validated with `actionlint` (no local install needed — ran the
    released binary directly): 0 errors.
  - Switched to `pnpm/setup@v3` instead of the more commonly documented
    `pnpm/action-setup` + `actions/setup-node` pair: one step installs pnpm
    (from `packageManager` in `package.json`) *and* Node.js (auto-detected
    from `.nvmrc`), with built-in pnpm-store caching.

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
