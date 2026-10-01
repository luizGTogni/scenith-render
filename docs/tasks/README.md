# Tasks

The [roadmap](../10-roadmap.md) broken down into tasks small enough to be
one pull request each. Every task traces back to a doc or an ADR.

## Files

| File | Phase | Goal |
|------|-------|------|
| [phase-0-foundation.md](phase-0-foundation.md) | 0 | Monorepo, CI, rules of the road. |
| [phase-1-scene-runtime-and-player.md](phase-1-scene-runtime-and-player.md) | 1 | A scene plays in the browser. |
| [phase-2-server-rendering.md](phase-2-server-rendering.md) | 2 | `kairon render scene.json out.mp4`. |
| [phase-3-media-and-audio.md](phase-3-media-and-audio.md) | 3 | Video, audio, mixing, loudness. |
| [phase-4-captions-transitions-ai.md](phase-4-captions-transitions-ai.md) | 4 | Captions, transitions, AI tooling. |
| [phase-5-performance-and-extensibility.md](phase-5-performance-and-extensibility.md) | 5 | Parallel + incremental rendering, code extensions. |
| [phase-6-release.md](phase-6-release.md) | 6 | v1.0. |
| [backlog.md](backlog.md) | Later | Ideas after v1.0. |

## How tasks are ordered

Inside every phase, tasks follow the same order. It mirrors the
architecture layers ([03](../03-architecture.md#layers-of-responsibility)):

```
1. Decisions     ADRs and spikes that later tasks depend on
2. Data model    schema types, validation        (@kairon/schema)
3. Runtime       timeline, animation, clip types (@kairon/core, media, captions, ...)
4. Drivers       player and page bridge          (@kairon/player, bridge)
5. Output        capture, encoding, audio        (@kairon/renderer)
6. Interface     CLI, preview app                (@kairon/cli, apps)
7. Verification  tests that prove the phase exit criteria
```

Rules:

- **Decide before building.** A task that needs an open decision depends on
  an `adr` task. The ADR is written and accepted before the code starts.
- **Lower layers first.** A task never depends on a task from a higher
  layer of the same phase. Services that a runtime component consumes
  (e.g. the media frame server used by `<Video>`) are listed before it.
- **IDs are an execution order.** A task only depends on tasks with a lower
  ID or from an earlier phase. Doing tasks in ID order is always valid;
  tasks without a dependency between them can run in parallel.
- **One task = one PR.** Each task is mergeable on its own, with tests.
- **Phases are gates.** A phase starts only when the previous phase's
  verification tasks pass.

## Task IDs and fields

IDs are `P<phase>-<nn>`, e.g. `P2-07`. Once work on a phase starts, its
IDs never change; tasks added later get the next free number and the
dependency rule above still applies.

Each task has:

| Field | Meaning |
|-------|---------|
| **Type** | `adr` (write a decision record), `spike` (time-boxed experiment that ends in an ADR), `infra`, `feat`, `test`, `docs`. |
| **Package** | Where the code goes. |
| **Size** | `S` ≤ 1 day · `M` 1–3 days · `L` 3–5 days. Anything bigger must be split. |
| **Depends on** | Tasks that must be done first. |
| **Refs** | Docs and ADRs that define the behavior. |
| **Done when** | Acceptance criteria. All must be true to close the task. |

Status is tracked in the table at the top of each phase file:
`todo` → `doing` → `done` (or `dropped`, with a reason).

## Definition of Done (every task)

- [ ] Acceptance criteria met.
- [ ] Unit tests added; CI green (lint, typecheck, test, build, license check).
- [ ] Public names follow the [naming policy](../11-legal-and-clean-room.md#api-naming-policy).
- [ ] PR states its sources (clean-room provenance).
- [ ] Docs updated in the same PR if behavior differs from them.
- [ ] TSDoc on every new public export.

## ADRs still to write

Open decisions found while planning. Each one is an `adr` or `spike` task.
The ADR number is assigned when it is written.

| Task | Decision |
|------|----------|
| P0-13 | Error model and where isomorphic shared code lives. |
| P1-01 | Scene versioning and migration policy. |
| P1-02 | Text layout model for the `text` clip type. |
| P2-01 | Color pipeline and output pixel format. |
| P2-02 | Minimum FFmpeg version and capability detection. |
| P2-03 | Frame capture method (spike + ADR). |
| P2-04 | Chromium version pinning and download. |
| P2-05 | Chunk grid size and segment encoding parameters. |
| P3-01 | Media frame server protocol and decoder lifecycle. |
| P4-01 | Transition model and crossfade rules. |
| P5-01 | Canonical JSON and hashing for chunk keys. |
| P6-01 | Legal review of license, FFmpeg policy and naming policy. |

## Traceability: accepted ADRs → tasks

| ADR | Implemented by |
|-----|----------------|
| [0001](../decisions/0001-react-and-headless-chromium.md) React + headless Chromium | P2-04, P2-07, P2-10 |
| [0002](../decisions/0002-monorepo-tooling.md) Monorepo tooling | P0-01, P0-02, P0-03, P0-04, P0-05, P0-06, P0-07, P0-09 |
| [0003](../decisions/0003-vite-as-bundler.md) Vite | P0-10, P5-10, P5-18 |
| [0004](../decisions/0004-ffmpeg-for-encoding.md) FFmpeg | P2-12, P3-04, P3-14, P3-15, P5-06, P5-07, P5-08, P5-09 |
| [0005](../decisions/0005-json-scene-schema.md) Scene schema | P1-03, P1-04, P1-05, P1-06, P1-07, P4-04, P4-05, P4-06 |
| [0006](../decisions/0006-server-first-export.md) Server-first export | Phase 2 as a whole; client export in backlog |
| [0007](../decisions/0007-mit-license.md) MIT | P0-04, P0-08, P6-01 |
| [0008](../decisions/0008-ffmpeg-not-bundled.md) FFmpeg not bundled | P2-02, P2-08, P2-20 |
| [0009](../decisions/0009-scene-first.md) Scene first | Phase order; P2-09, P2-11, P5-22 |
| [0010](../decisions/0010-own-api-vocabulary.md) Own vocabulary | P0-11, Definition of Done, P6-02 |
