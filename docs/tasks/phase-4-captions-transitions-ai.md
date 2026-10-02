# Phase 4 — Captions, transitions and AI tooling

**Goal:** the features that make Scenith useful to an AI-driven editor.

**Exit criteria:** word highlights stay within ±1 frame of the given
timings; an LLM, given only `toJsonSchema()` and `describeRegistry()`,
produces valid scenes for a test set of prompts and applies edits as
patches.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| **Decisions** |||||
| P4-01 | ADR: transition model and crossfade rules | adr | S | — | todo |
| **Data model** — `@scenith-render/schema` |||||
| P4-02 | Transitions in the schema and visible ranges | feat | M | P4-01, P1-06 | todo |
| P4-03 | `captions` clip schema and word validation | feat | S | P1-07 | todo |
| P4-04 | `applyPatch` with `@id` paths | feat | M | P1-05 | todo |
| P4-05 | `migrateScene` framework | feat | S | P1-01, P1-05 | todo |
| P4-06 | `toJsonSchema` and `describeRegistry` | feat | M | P1-07, P4-02, P4-03 | todo |
| **Runtime** |||||
| P4-07 | Transition presets and `defineTransition` | feat | M | P4-01, P1-18 | todo |
| P4-08 | Crossfades in `SceneView` | feat | M | P4-02, P4-07 | todo |
| P4-09 | `groupWords` | feat | M | P4-03 | todo |
| P4-10 | `<Captions>` rendering and styles | feat | L | P4-09, P1-17 | todo |
| P4-11 | Caption presets and page transitions | feat | M | P4-10 | todo |
| P4-12 | SRT/VTT import and `cuesToWords` | feat | S | P4-03 | todo |
| P4-13 | `captions` clip type | feat | S | P4-11 | todo |
| **Interface** |||||
| P4-14 | `scenith schema` | feat | S | P4-06, P2-16 | todo |
| **Verification** |||||
| P4-15 | Caption timing accuracy test | test | S | P4-13 | todo |
| P4-16 | LLM evaluation harness | test | M | P4-04, P4-06 | todo |

---

### P4-01 · ADR: transition model and crossfade rules
- **Type:** adr · **Size:** S
- **Refs:** [08 — crossfades](../08-scene-schema.md#crossfades)
- **Decide:** how a transition receives progress (0–1) and wraps the clip; how two clips are composited during an overlap; what happens with audio during a crossfade; the `defineTransition` contract; JSON shape of each preset.
- **Done when:** [ ] ADR accepted.

### P4-02 · Transitions in the schema and visible ranges
- **Type:** feat · **Package:** schema · **Size:** M
- **Depends on:** P4-01, P1-06
- **Done when:** [ ] `transitionIn`/`transitionOut` validated; [ ] same-track overlap allowed only within a `transitionIn`; [ ] `normalizeScene` computes each clip's visible range (needed later by P5-03).

### P4-03 · `captions` clip schema and word validation
- **Type:** feat · **Package:** schema · **Size:** S
- **Depends on:** P1-07
- **Refs:** [12 — input](../12-captions.md#input-word-timings)
- **Done when:** [ ] words `{ text, start, end, emphasis?, estimated? }` in ms; [ ] sorted, `start < end`, `SCENITH_E_CAPTION_OVERLAP`; [ ] out-of-range words produce warnings.

### P4-04 · `applyPatch` with `@id` paths
- **Type:** feat · **Package:** schema · **Size:** M
- **Depends on:** P1-05
- **Refs:** [08 — patches](../08-scene-schema.md#patches)
- **Done when:** [ ] `@<id>` segments and `/clips/@<id>` shortcut resolved to indices; [ ] RFC 6902 ops; [ ] atomic: invalid result returns errors and leaves the scene unchanged; [ ] metadata paths patchable.

### P4-05 · `migrateScene` framework
- **Type:** feat · **Package:** schema · **Size:** S
- **Depends on:** P1-01, P1-05
- **Done when:** [ ] migration chain per P1-01; [ ] a fixture "v0 → v1" migration proves the mechanism; [ ] metadata preserved.

### P4-06 · `toJsonSchema` and `describeRegistry`
- **Type:** feat · **Package:** schema · **Size:** M
- **Depends on:** P1-07, P4-02, P4-03
- **Done when:** [ ] JSON Schema includes custom clip types and all `describe()` texts; [ ] `metadata` excluded unless opted in; [ ] `describeRegistry` output is compact Markdown, snapshot-tested.

### P4-07 · Transition presets and `defineTransition`
- **Type:** feat · **Package:** transitions · **Size:** M
- **Depends on:** P4-01, P1-18
- **Done when:** [ ] `fade`, `slide`, `wipe`, `zoom`; [ ] presets return the scene JSON shape; [ ] `defineTransition` for custom ones.

### P4-08 · Crossfades in `SceneView`
- **Type:** feat · **Package:** schema (`/react`) · **Size:** M
- **Depends on:** P4-02, P4-07
- **Done when:** [ ] overlapping clips are blended per P4-01; [ ] golden tests for each preset.

### P4-09 · `groupWords`
- **Type:** feat · **Package:** captions · **Size:** M
- **Depends on:** P4-03
- **Refs:** [12 — grouping](../12-captions.md#grouping-into-pages)
- **Done when:** [ ] all grouping options with defaults from [12](../12-captions.md); [ ] deterministic; [ ] table-driven tests.

### P4-10 · `<Captions>` rendering and styles
- **Type:** feat · **Package:** captions · **Size:** L
- **Depends on:** P4-09, P1-17
- **Done when:** [ ] word states `upcoming`/`active`/`spoken` with base + per-state styles; [ ] emphasis styles; [ ] wrapping in `maxWidth`, safe area; [ ] layout only after fonts load.

### P4-11 · Caption presets and page transitions
- **Type:** feat · **Package:** captions · **Size:** M
- **Depends on:** P4-10
- **Done when:** [ ] `plain`, `highlight`, `box`, `pop`, `karaoke`, `reveal`; [ ] any preset value overridable; [ ] `pageTransition` options.

### P4-12 · SRT/VTT import and `cuesToWords`
- **Type:** feat · **Package:** captions · **Size:** S
- **Depends on:** P4-03
- **Done when:** [ ] `parseSrt`, `parseVtt`; [ ] `cuesToWords` splits by character count and sets `estimated: true`.

### P4-13 · `captions` clip type
- **Type:** feat · **Package:** schema (`/react`) · **Size:** S
- **Depends on:** P4-11
- **Done when:** [ ] built-in registered; [ ] ms → frame conversion as in [12](../12-captions.md#input-word-timings).

### P4-14 · `scenith schema`
- **Type:** feat · **Package:** cli · **Size:** S
- **Depends on:** P4-06, P2-16
- **Done when:** [ ] prints or writes the JSON Schema (`--out`).

### P4-15 · Caption timing accuracy test
- **Type:** test · **Size:** S
- **Depends on:** P4-13
- **Done when:** [ ] at several fps (24, 30, 60) the active word changes within ±1 frame of its `start`.

### P4-16 · LLM evaluation harness
- **Type:** test · **Package:** `tests/llm-eval` · **Size:** M
- **Depends on:** P4-04, P4-06
- **Done when:**
  - [ ] Prompt set (create + edit) with expected properties.
  - [ ] Runner generates scenes/patches with a model, validates, reports first-try validity rate.
  - [ ] Runs manually (needs an API key), not in CI; results committed per run.
  - [ ] Target: > 90 % valid on first try for simple prompts.
