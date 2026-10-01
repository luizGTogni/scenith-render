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
