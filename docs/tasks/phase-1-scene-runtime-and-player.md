# Phase 1 — Scene runtime + Player (MVP preview)

**Goal:** a hand-written `scene.json` plays in the browser.

**Exit criteria** (from the [roadmap](../10-roadmap.md#phase-1--scene-runtime--player-mvp-preview)):
a scene with animated text and images plays and seeks correctly in the
playground; invalid scenes return path-level errors; `metadata` survives a
validate/normalize round trip unchanged.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| **Decisions** |||||
| P1-01 | ADR: scene versioning and migration policy | adr | S | — | todo |
| P1-02 | ADR: text layout model | adr | S | — | todo |
| **Data model** — `@kairon/schema` |||||
| P1-03 | Scene types and Zod schemas | feat | M | P0-13, P1-01 | todo |
| P1-04 | Animation, keyframe and easing schemas | feat | S | P1-03 | todo |
| P1-05 | `validateScene` with paths and codes | feat | M | P1-03, P1-04 | todo |
| P1-06 | `normalizeScene` and metadata preservation | feat | M | P1-05 | todo |
| P1-07 | Clip type registry | feat | M | P1-05 | todo |
| **Runtime** — `@kairon/core`, `@kairon/media` |||||
| P1-08 | Frame context, `Clip` and timeline hooks | feat | M | P0-04 | todo |
| P1-09 | `Track`, `Repeat`, `FreezeFrame`, `Layer` | feat | M | P1-08 | todo |
| P1-10 | `animate` with numeric keyframes | feat | M | P0-04 | todo |
| P1-11 | Easings: named, cubic Bézier, spring | feat | M | P1-10 | todo |
| P1-12 | Color keyframes in OKLab | feat | S | P1-10 | todo |
| P1-13 | `random` and `seconds` | feat | S | P1-08 | todo |
| P1-14 | Holds | feat | M | P1-08 | todo |
| P1-15 | Frame driver contract and asset usage registry | feat | M | P1-08, P1-14 | todo |
| P1-16 | `defineComposition`, `defineProject`, `useComposition`, `useEnvironment` | feat | S | P1-08 | todo |
| P1-17 | `loadFont` | feat | S | P1-14 | todo |
| P1-18 | `SceneView` and the clip wrapper | feat | L | P1-09, P1-11, P1-12, P1-06, P1-07 | todo |
| P1-19 | `text` clip type | feat | M | P1-02, P1-18, P1-17 | todo |
| P1-20 | `<Image>` and `image` clip type | feat | M | P1-14, P1-18 | todo |
| P1-21 | `shape` clip type | feat | S | P1-18 | todo |
| **Driver** — `@kairon/player` |||||
| P1-22 | Player core: clock, seek, scene mode, scaling | feat | L | P1-15, P1-18 | todo |
| P1-23 | `PlayerRef` API and events | feat | M | P1-22 | todo |
| P1-24 | Buffering and error boundary | feat | M | P1-22 | todo |
| P1-25 | Default controls | feat | S | P1-23 | todo |
| P1-26 | `<FrameView>` | feat | S | P1-22 | todo |
| **Verification** |||||
| P1-27 | Phase 1 demo scene and exit checks | test | S | P1-19, P1-20, P1-21, P1-17, P1-22, P1-23, P1-24, P1-25, P1-26 | todo |

---

## Decisions

### P1-01 · ADR: scene versioning and migration policy
- **Type:** adr · **Size:** S
- **Refs:** [08](../08-scene-schema.md), [ADR 0005](../decisions/0005-json-scene-schema.md)
- **Decide:** format of `version`; which changes are compatible (new optional field) vs breaking (rename, semantics); how migrations are chained; how long old versions are accepted; relation between scene version and package version.
- **Done when:** [ ] ADR accepted; [08](../08-scene-schema.md) links to it.

### P1-02 · ADR: text layout model
- **Type:** adr · **Size:** S
- **Refs:** [08](../08-scene-schema.md#concepts), [02 — units](../02-core-concepts.md#units)
- **Decide:** the `text` clip props: box (width, alignment, anchor), wrapping, auto-fit to box, line height, letter spacing, stroke, shadow, background box; what "position" anchors to; how font size scales with normalized units.
- **Done when:** [ ] ADR accepted; props listed in [08](../08-scene-schema.md).

## Data model

### P1-03 · Scene types and Zod schemas
- **Type:** feat · **Package:** schema (root) · **Size:** M
- **Depends on:** P0-13, P1-01
- **Refs:** [08 — shape](../08-scene-schema.md#shape)
- **Done when:**
  - [ ] Zod schemas and inferred TS types for `Scene`, `Settings`, `Asset`, `Track`, `Clip`.
  - [ ] `metadata` accepted on scene, track, clip and asset (JSON object, size limit configurable, default 16 KB).
  - [ ] Clip `type` accepts built-in names and `custom:<name>`.
  - [ ] No React/DOM import (lint passes).

### P1-04 · Animation, keyframe and easing schemas
- **Type:** feat · **Package:** schema · **Size:** S
- **Depends on:** P1-03
- **Refs:** [02 — keyframes](../02-core-concepts.md#keyframes-and-easing)
- **Done when:**
  - [ ] `animations[]` with `property` and `keyframes[]` (`frame`, `value` number or color, optional `easing`).
  - [ ] Easing union: names, `{ type: "cubicBezier" }`, `{ type: "spring" }`.
  - [ ] Keyframes must be sorted by frame and within the clip duration.

### P1-05 · `validateScene` with paths and codes
- **Type:** feat · **Package:** schema · **Size:** M
- **Depends on:** P1-03, P1-04
- **Refs:** [08 — API](../08-scene-schema.md#api)
- **Done when:**
  - [ ] Returns `{ ok: true, scene }` or `{ ok: false, errors: { path, code, message }[] }`.
  - [ ] Checks: ids unique across the scene, asset references exist, clips on the same track do not overlap, clips within `settings.duration`.
  - [ ] Error messages are short and LLM-readable; snapshot tests for each code.

### P1-06 · `normalizeScene` and metadata preservation
- **Type:** feat · **Package:** schema · **Size:** M
- **Depends on:** P1-05
- **Done when:**
  - [ ] Fills defaults, sorts clips by `from`, resolves units.
  - [ ] Property test: `metadata` at every level is deep-equal after validate → normalize.
  - [ ] Normalization is idempotent (`normalize(normalize(s)) == normalize(s)`).

### P1-07 · Clip type registry
- **Type:** feat · **Package:** schema · **Size:** M
- **Depends on:** P1-05
- **Refs:** [08 — registry](../08-scene-schema.md#component-registry)
- **Done when:**
  - [ ] `defineClipType({ name, description, props, component, cacheable? })` and `createRegistry()`.
  - [ ] Root entry stores definitions without importing React (component typed as `unknown` there, typed properly in `/react`).
  - [ ] `validateScene(json, registry)` validates each clip's props against its clip type.
  - [ ] Built-ins are always registered.

## Runtime

### P1-08 · Frame context, `Clip` and timeline hooks
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P0-04
- **Refs:** [02 — clips](../02-core-concepts.md#clips-and-clip-types)
- **Done when:**
  - [ ] `<Clip from duration>` renders children only inside its range; nested offsets add up.
  - [ ] `useFrame()` (clip-relative), `useGlobalFrame()`, `useClip()` (`from`, `duration`, `progress`).
  - [ ] Tests cover nesting, boundaries (first/last frame) and clips outside the range.

### P1-09 · `Track`, `Repeat`, `FreezeFrame`, `Layer`
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P1-08
- **Done when:**
  - [ ] `<Track sequential>` places child clips back to back.
  - [ ] `<Repeat every times>`, `<FreezeFrame at>`, `<Layer>` (absolute, full size).

### P1-10 · `animate` with numeric keyframes
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P0-04
- **Refs:** [09 — animation](../09-api-design.md#kaironcore)
- **Done when:**
  - [ ] `animate(frame, keyframes, { before, after })`; default `hold`.
  - [ ] Easing applies to the segment arriving at a keyframe.
  - [ ] Pure function, no React dependency; 100 % branch coverage.

### P1-11 · Easings: named, cubic Bézier, spring
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P1-10
- **Done when:**
  - [ ] Named curves from [09](../09-api-design.md#kaironcore), `cubicBezier`, function easings.
  - [ ] Spring easing normalized to the segment duration (reaches the target at the end keyframe).
  - [ ] Implemented from public math references; sources listed in the PR.

### P1-12 · Color keyframes in OKLab
- **Type:** feat · **Package:** core · **Size:** S
- **Depends on:** P1-10
- **Done when:**
  - [ ] `animate` accepts CSS color values; interpolates in OKLab, returns an `rgba()`/hex string.
  - [ ] Alpha interpolated linearly.

### P1-13 · `random` and `seconds`
- **Type:** feat · **Package:** core · **Size:** S
- **Depends on:** P1-08
- **Done when:** [ ] `random(seed)` deterministic across runs and platforms; [ ] `seconds(s)` uses the current fps.

### P1-14 · Holds
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P1-08
- **Refs:** [02 — holds](../02-core-concepts.md#render-holds-async-readiness)
- **Done when:**
  - [ ] `useHold(label, { timeoutMs })` returns `{ release }`; release is idempotent.
  - [ ] Hold registry exposes "all released" as a promise; timeout produces `KAIRON_E_HOLD_TIMEOUT` with the label.

### P1-15 · Frame driver contract and asset usage registry
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P1-08, P1-14
- **Refs:** [03 — frame driver](../03-architecture.md#the-frame-driver-contract)
- **Done when:**
  - [ ] `FrameDriver` interface with `seek`, `waitUntilReady`, `collectAssets`.
  - [ ] Asset usage registry API that media components will report into (no media yet).
  - [ ] A test driver used by unit tests.

### P1-16 · `defineComposition`, `defineProject`, `useComposition`, `useEnvironment`
- **Type:** feat · **Package:** core · **Size:** S
- **Depends on:** P1-08
- **Done when:** [ ] scene-based compositions supported (code-based in P5-13); [ ] hooks return values from context.

### P1-17 · `loadFont`
- **Type:** feat · **Package:** media · **Size:** S
- **Depends on:** P1-14
- **Done when:** [ ] loads via `FontFace` behind a hold; [ ] same font requested twice loads once.

### P1-18 · `SceneView` and the clip wrapper
- **Type:** feat · **Package:** schema (`/react`) · **Size:** L
- **Depends on:** P1-09, P1-11, P1-12, P1-06, P1-07
- **Refs:** [08 — runtime](../08-scene-schema.md#runtime)
- **Done when:**
  - [ ] Each track renders as a `Layer`, each clip as a `Clip` with its clip type component.
  - [ ] A shared clip wrapper applies `opacity`, `x`, `y`, `scale`, `rotation` animations and normalized positioning.
  - [ ] `metadata` is never passed to clip components (test).
  - [ ] Unknown clip type renders an error placeholder in dev, throws in rendering.

### P1-19 · `text` clip type
- **Type:** feat · **Package:** schema (`/react`) · **Size:** M
- **Depends on:** P1-02, P1-18, P1-17
- **Done when:** [ ] implements the props from P1-02; [ ] waits for fonts via holds before layout.

### P1-20 · `<Image>` and `image` clip type
- **Type:** feat · **Package:** media, schema · **Size:** M
- **Depends on:** P1-14, P1-18
- **Done when:** [ ] `<Image>` holds until decoded (`img.decode()`); [ ] `fit` (cover, contain, fill); [ ] decode errors become `KAIRON_E_MEDIA_LOAD` with the src.

### P1-21 · `shape` clip type
- **Type:** feat · **Package:** schema (`/react`) · **Size:** S
- **Depends on:** P1-18
- **Done when:** [ ] rectangle, ellipse, line; fill, stroke, corner radius; animatable color.

## Driver

### P1-22 · Player core: clock, seek, scene mode, scaling
- **Type:** feat · **Package:** player · **Size:** L
- **Depends on:** P1-15, P1-18
- **Refs:** [06](../06-player.md)
- **Done when:**
  - [ ] `<Player scene registry?>` plays, pauses, seeks, loops.
  - [ ] Clock based on `performance.now()`; frames are skipped, never slowed, when rendering lags.
  - [ ] Scales to container while keeping the scene's resolution for layout.
  - [ ] New `scene` prop re-renders the current frame without resetting playback.

### P1-23 · `PlayerRef` API and events
- **Type:** feat · **Package:** player · **Size:** M
- **Depends on:** P1-22
- **Done when:** [ ] all methods and events from [06](../06-player.md#imperative-api-playerref); [ ] `frame` event throttled; [ ] `speed` and `range`.

### P1-24 · Buffering and error boundary
- **Type:** feat · **Package:** player · **Size:** M
- **Depends on:** P1-22
- **Done when:** [ ] active holds pause the clock and show `renderBuffering`; [ ] a failing clip shows an overlay with frame and scene path.

### P1-25 · Default controls
- **Type:** feat · **Package:** player · **Size:** S
- **Depends on:** P1-23
- **Done when:** [ ] play/pause, scrubber, time display, fullscreen; keyboard accessible.

### P1-26 · `<FrameView>`
- **Type:** feat · **Package:** player · **Size:** S
- **Depends on:** P1-22
- **Done when:** [ ] renders a single static frame; [ ] many instances on one page stay responsive (timeline thumbnails).

## Verification

### P1-27 · Phase 1 demo scene and exit checks
- **Type:** test · **Package:** playground, tests · **Size:** S
- **Depends on:** P1-19, P1-20, P1-21, P1-17, P1-22, P1-23, P1-24, P1-25, P1-26
- **Done when:**
  - [ ] `examples/scenes/phase-1.json`: animated text, image, shape, spring and color keyframes, metadata.
  - [ ] Playground shows it in the Player; seeking to any frame matches a fresh render of that frame.
  - [ ] Invalid fixture scenes produce the expected error paths (snapshot).
  - [ ] All exit criteria above checked off.
