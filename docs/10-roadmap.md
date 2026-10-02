# 10 — Roadmap

Each phase ends with something that works end to end. Do not start a phase
before the previous one's exit criteria are met.

Each phase is broken down into tasks in [`tasks/`](tasks/README.md).

The order follows [ADR 0009](decisions/0009-scene-first.md): scenes come
first; the bundler and code-based compositions come later.

## Phase 0 — Foundation

- Monorepo: pnpm, Turborepo, TypeScript, ESLint, Prettier, Vitest.
- CI: lint, typecheck, unit tests, license check.
- Empty packages with build output and environment-boundary lint rules.
- `apps/playground` running with Vite.

**Exit:** `pnpm build && pnpm test` passes on CI.

## Phase 1 — Scene runtime + Player (MVP preview)

- `@scenith-render/core`: `Clip`, `Track`, `Repeat`, `FreezeFrame`, `Layer`, hooks,
  `animate`, easings (incl. spring), `random`, holds, frame driver.
- `@scenith-render/schema`: types, Zod validation with paths and codes,
  `normalizeScene`, `version`, `metadata` preservation.
- `SceneView` with built-in `text`, `image` and `shape` clip types,
  keyframe animations.
- `@scenith-render/player` in scene mode: play, pause, seek, loop, scaling, events.
- `<Image>` and `loadFont` with holds.

**Exit:** a hand-written `scene.json` with animated text and images plays and
seeks correctly in the playground; invalid scenes return path-level errors;
`metadata` survives a validate/normalize round trip unchanged.

## Phase 2 — Server rendering (MVP export)

- Prebuilt standard runtime and page bridge.
- `@scenith-render/renderer`: FFmpeg detection, browser launch, capture loop,
  chunk grid encoding + concat (single worker), `renderImage`.
- `@scenith-render/cli`: `render`, `image`, `validate`.
- Visual regression harness (golden frames).

**Exit:** `scenith render scene.json out.mp4` produces a correct MP4 with no
project and no build step; golden tests run in CI.

## Phase 3 — Media and audio

- Media frame server; frame-accurate `<Video>` in the renderer.
- `video` and `audio` clip types; sync in the player.
- Asset usage registry, scene-derived audio timeline, FFmpeg mixing,
  volume curves and fades.
- Loudness normalization presets (two-pass `loudnorm`).
- `probeMedia`, `<Gif>`, remote media cache, asset fingerprints.

**Exit:** a scene with two videos, music and a voiceover renders with audio
in sync (±1 frame) and matches the player; `--loudness=streaming` output
measures −14 LUFS ±1 LU.

## Phase 4 — Captions, transitions and AI tooling

- `@scenith-render/captions`: `captions` clip type, grouping, presets, styles,
  SRT/VTT import.
- `@scenith-render/transitions`: presets, `transitionIn`/`transitionOut`, crossfades.
- `applyPatch` with `@id` paths, `migrateScene`, `toJsonSchema`,
  `describeRegistry`, `scenith schema`.

**Exit:** word highlights stay within ±1 frame of the given timings; an LLM,
given only `toJsonSchema()` and `describeRegistry()`, produces valid scenes
for a test set of prompts and applies edits as patches.

## Phase 5 — Performance and extensibility

- Parallel workers on the chunk queue.
- Incremental export: chunk keys, local chunk cache, `ChunkStore`
  interface, `--verify-cache`.
- WebM, ProRes, GIF, PNG sequence, transparency; opt-in hardware encoders;
  `scenith benchmark`.
- Code extensions: `defineClipType` with custom components, `@scenith-render/bundler`
  (Vite), project bundles, code-based compositions with `cacheKey`,
  `scenith preview` app.
- Docs and examples teach "code as clip types inside a scene" as the
  default pattern (see [13](13-incremental-rendering.md#code-based-compositions)).

**Exit:** 30 s 1080p30 reference renders in < 30 s on an 8-core machine;
editing one 3 s text clip in a 60 s scene re-renders at most 3 chunks.

## Phase 6 — v1.0

- API freeze, full API docs, error code catalog.
- Examples and templates.
- Public release under the MIT license.

## Later

- Automatic prop dependency tracking for incremental export of code-based
  compositions (`cache: { trackProps: true }`).
- `@scenith-render/cloud`: distributed rendering (coordinator + `renderChunk` workers).
- Client-side export with WebCodecs for canvas-based scenes.
- Per-source loudness normalization and automatic ducking (music under voice).
- Audio visualization helpers (waveforms, spectrum).
- Lottie and three.js clip types.
- OpenTimelineIO import/export.
