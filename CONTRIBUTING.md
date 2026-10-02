# Contributing

## Setup

Prerequisites: Node.js (version pinned in [`.nvmrc`](.nvmrc)) and pnpm
(version pinned in `package.json`'s `packageManager`; `corepack enable`
picks it up automatically, or install it yourself to match).

```bash
git clone git@github.com:luizGTogni/scenith-render.git
cd scenith-render
pnpm install   # also runs `prepare`, which enables the commit-msg hook
```

Common commands, all runnable from the repo root (each goes through
Turborepo, scoped to the packages it touches, with caching — see
[docs/tasks/README.md](docs/tasks/README.md)):

| Command | Does |
|---------|------|
| `pnpm build` | Build every package. |
| `pnpm typecheck` | Type-check every package. |
| `pnpm lint` | Lint every package (ESLint + the environment-boundary rules). |
| `pnpm test` | Run unit tests. |
| `pnpm test:coverage` | One instrumented run across the whole workspace, with a coverage report. |
| `pnpm format` / `format:check` | Prettier, write or check only. |
| `pnpm check-licenses` | Fail if a production dependency's license isn't allow-listed. |
| `pnpm changeset` | Record a change for the next release (see [Versioning](#versioning-changesets)). |

Scope any command to one package with `--filter`, e.g.
`pnpm --filter @scenith-render/core test`. To try the engine interactively,
`pnpm --filter @scenith-render/playground dev` starts the sandbox app
(see [apps/playground](apps/playground/README.md)).

FFmpeg is not needed yet for Phase 0/1 work. It becomes a prerequisite once
rendering work starts (Phase 2+) — see
[ADR 0008](docs/decisions/0008-ffmpeg-not-bundled.md) for why Scenith never
bundles it and how it's located.

## Clean room and naming

Scenith is built as an **independent implementation**, not derived from
Remotion or any other restricted-license codebase — see
[docs/11-legal-and-clean-room.md](docs/11-legal-and-clean-room.md) for the
full policy. In short:

- Implement features from the specs in [`docs/`](docs/README.md), not by
  reading another engine's source. General, widely-known techniques and
  public documentation are fine; copying or adapting someone else's code,
  tests, types or comments is not.
- Public API names follow Scenith's own vocabulary
  ([ADR 0010](docs/decisions/0010-own-api-vocabulary.md)), never another
  engine's identifiers — see the
  [API naming policy](docs/11-legal-and-clean-room.md#api-naming-policy)
  for the specific list of names to avoid and why.
- State the sources you used in the PR (specs, public docs, standards) —
  this is part of the PR template.

## Pull requests

Opening a PR fills in the template
([`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)),
which mirrors the
[Definition of Done](docs/tasks/README.md#definition-of-done-every-task)
every task in [`docs/tasks/`](docs/tasks/README.md) is held to: sources
used, the naming policy followed, docs updated alongside behavior changes,
and tests added. CI (lint, typecheck, test, build, license check) must pass
before merging — see [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
and are **a single line**:

```
<type>(<scope>): <description>
```

```
feat(core): add animate with numeric keyframes
fix(renderer): release holds when a chunk is cancelled
docs: add chunk grid ADR
build: set up turborepo pipeline
feat(schema)!: rename clip duration field
```

Rules:

- **One line only.** No body, no bullet lists, no trailers
  (`Co-Authored-By`, `Signed-off-by`, tool attributions, etc.).
- **72 characters max.**
- **Description:** imperative ("add", not "added"), starts lowercase, no
  period at the end.
- **Breaking change:** add `!` after the type/scope. Explain it in the PR
  and in the changeset, not in the commit.
- **Reverts** use `revert: <original description>`, not git's default
  multi-line message.

### Types

| Type | Use for |
|------|---------|
| `feat` | A new feature or public API. |
| `fix` | A bug fix. |
| `perf` | A performance improvement. |
| `refactor` | Code change that neither fixes a bug nor adds a feature. |
| `test` | Adding or fixing tests. |
| `docs` | Documentation only (including ADRs and tasks). |
| `build` | Build system, dependencies, package config. |
| `ci` | CI workflows. |
| `chore` | Maintenance that fits nothing above. |
| `style` | Formatting only. |
| `revert` | Reverting a previous commit. |

### Scopes

Optional. Use the package or area that changed:

`core`, `schema`, `media`, `captions`, `transitions`, `player`, `bundler`,
`renderer`, `cli`, `preview`, `playground`, `deps`, `release`.

Omit the scope when a change spans several packages or is repo-wide.

### Enforcement

A `commit-msg` hook in [`.githooks/`](.githooks/commit-msg) rejects
messages that break these rules. Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

(After Phase 0 this runs automatically from the root `prepare` script.)

## Versioning (Changesets)

All `@scenith-render/*` product packages (`core`, `schema`, `media`, `captions`,
`transitions`, `player`, `bundler`, `renderer`, `cli`) are versioned and
released together, as one `fixed` [Changesets](https://github.com/changesets/changesets)
group — see [ADR 0002](docs/decisions/0002-monorepo-tooling.md) and
[P0-07](docs/tasks/phase-0-foundation.md). The `tooling/*` packages are
private and are never released, so Changesets ignores them entirely.

Any PR that changes a published package's behavior needs a changeset:

```bash
pnpm changeset
```

This asks which package(s) changed (picking any one `fixed`-group package
bumps the whole group together) and the bump type (patch / minor / major),
then opens an editor for the changelog entry. Commit the generated
`.changeset/<name>.md` file alongside your change. Docs-only, test-only, or
internal tooling changes usually don't need one.

Releasing (`pnpm changeset:version` to bump versions and changelogs,
`pnpm changeset publish` to publish to npm) is not a contributor task — it
runs through the release pipeline built in
[P6-07](docs/tasks/phase-6-release.md).
