# Contributing

> Setup, clean-room rules and the PR template are added in task
> [P0-11](docs/tasks/phase-0-foundation.md). This file starts with the
> commit convention.

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

All `@kairon/*` product packages (`core`, `schema`, `media`, `captions`,
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
