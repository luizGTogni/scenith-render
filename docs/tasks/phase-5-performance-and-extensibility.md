# Phase 5 — Performance and extensibility

**Goal:** fast renders, fast re-exports, and code extensions.

**Exit criteria:** a 30 s 1080p30 reference renders in < 30 s on an 8-core
machine; editing one 3 s text clip in a 60 s scene re-renders at most 3
chunks; a custom clip type works in a scene in player and render.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| **Decisions** |||||
| P5-01 | ADR: canonical JSON and hashing for chunk keys | adr | S | — | todo |
| **Output: parallel and incremental** |||||
| P5-02 | Browser pool and chunk queue | feat | M | P2-14 | todo |
| P5-03 | Chunk keys | feat | M | P5-01, P4-02, P3-03 | todo |
| P5-04 | `ChunkStore` and local store | feat | M | P5-03 | todo |
| P5-05 | `--verify-cache` and `--no-cache` | feat | S | P5-04 | todo |
| **Output: formats** |||||
| P5-06 | H.265 and WebM (VP8/VP9, alpha) | feat | M | P2-12 | todo |
| P5-07 | ProRes (incl. 4444 alpha) | feat | S | P2-12 | todo |
| P5-08 | GIF and PNG sequence | feat | M | P2-12 | todo |
| P5-09 | Opt-in hardware encoders | feat | M | P2-08 | todo |
| **Extensibility** |||||
| P5-10 | `@kairon-render/bundler`: project bundles | feat | L | P2-09 | todo |
| P5-11 | Custom clip types end to end | feat | M | P5-10, P1-07 | todo |
| P5-12 | `cacheable: false` clip types | feat | S | P5-03, P5-11 | todo |
| P5-13 | Code-based compositions and `resolve` | feat | M | P5-10 | todo |
| P5-14 | `cacheKey` for code-based compositions | feat | S | P5-03, P5-13 | todo |
| P5-15 | Player composition mode | feat | S | P5-13 | todo |
| P5-16 | Dev-mode determinism warnings | feat | S | P1-14 | todo |
| **Interface** |||||
| P5-17 | `kairon benchmark` | feat | S | P5-02 | todo |
| P5-18 | `kairon preview` app | feat | L | P5-10, P5-15 | todo |
| P5-19 | `kairon list` | feat | S | P5-13 | todo |
| **Verification** |||||
| P5-20 | Benchmark suite and performance gate | test | M | P5-02 | todo |
| P5-21 | Incremental export test | test | S | P5-05 | todo |
| P5-22 | Guide: code as clip types inside a scene | docs | S | P5-11 | todo |

---

### P5-01 · ADR: canonical JSON and hashing for chunk keys
- **Type:** adr · **Size:** S
- **Refs:** [13 — chunk key](../13-incremental-rendering.md#the-chunk-key)
- **Decide:** canonicalization (e.g. RFC 8785 JCS), hash function, key format and versioning, what exactly is in the visual slice.
- **Done when:** [ ] ADR accepted.

### P5-02 · Browser pool and chunk queue
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-14
- **Done when:** [ ] `concurrency` (number or `%`); [ ] workers pull chunks from a queue; [ ] one failing chunk cancels the render cleanly.

### P5-03 · Chunk keys
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P5-01, P4-02, P3-03
- **Refs:** [13](../13-incremental-rendering.md)
- **Done when:** [ ] key from all inputs listed in [13](../13-incremental-rendering.md#the-chunk-key); [ ] `metadata`, ids and audio-only clips excluded (tests prove changing them keeps keys); [ ] visible ranges include transitions.

### P5-04 · `ChunkStore` and local store
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P5-03
- **Done when:** [ ] `ChunkStore` interface; [ ] local directory store with LRU by `maxSizeMb`; [ ] cached segments reused in assembly; [ ] `chunksReused`/`chunksRendered` in the result.

### P5-05 · `--verify-cache` and `--no-cache`
- **Type:** feat · **Package:** renderer, cli · **Size:** S
- **Depends on:** P5-04
- **Done when:** [ ] verify re-renders a sample of reused chunks and compares frame hashes; mismatch → error naming the clip types in the chunk.

### P5-06 · H.265 and WebM (VP8/VP9, alpha)
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-12
- **Done when:** [ ] codecs selectable; [ ] VP8/VP9 with alpha from PNG capture; [ ] Opus audio for WebM.

### P5-07 · ProRes (incl. 4444 alpha)
- **Type:** feat · **Package:** renderer · **Size:** S
- **Depends on:** P2-12
- **Done when:** [ ] ProRes profiles selectable; [ ] 4444 keeps alpha.

### P5-08 · GIF and PNG sequence
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-12
- **Done when:** [ ] GIF with palette generation across the whole video (not per chunk); [ ] PNG sequence with configurable file pattern.

### P5-09 · Opt-in hardware encoders
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-08
- **Done when:** [ ] `hardwareAcceleration: "auto"` picks NVENC/VideoToolbox/VAAPI when present; [ ] falls back to software with a warning.

### P5-10 · `@kairon-render/bundler`: project bundles
- **Type:** feat · **Package:** bundler · **Size:** L
- **Depends on:** P2-09
- **Refs:** [ADR 0003](../decisions/0003-vite-as-bundler.md), [03 — runtime bundles](../03-architecture.md#runtime-bundles)
- **Done when:** [ ] builds standard runtime + project entry with Vite; [ ] `vite` config hook; [ ] cached by content hash; [ ] `buildProject` in the renderer.

### P5-11 · Custom clip types end to end
- **Type:** feat · **Package:** schema, renderer, player · **Size:** M
- **Depends on:** P5-10, P1-07
- **Done when:** [ ] a `custom:lower-third` works in player and in `renderVideo({ source: { scene, build } })`; [ ] example in `examples/`.

### P5-12 · `cacheable: false` clip types
- **Type:** feat · **Package:** renderer · **Size:** S
- **Depends on:** P5-03, P5-11
- **Done when:** [ ] chunks containing such clips always re-render.

### P5-13 · Code-based compositions and `resolve`
- **Type:** feat · **Package:** core, renderer · **Size:** M
- **Depends on:** P5-10
- **Done when:** [ ] `defineComposition({ component, ... })` renders; [ ] `propsSchema` validation; [ ] `resolve(props)` can change settings.

### P5-14 · `cacheKey` for code-based compositions
- **Type:** feat · **Package:** core, renderer · **Size:** S
- **Depends on:** P5-03, P5-13
- **Refs:** [13 — manual cache key](../13-incremental-rendering.md#2-manual-cache-key-escape-hatch-v10)
- **Done when:** [ ] `cacheKey(props, range)` replaces "all props" in the key; [ ] docs warn about wrong keys.

### P5-15 · Player composition mode
- **Type:** feat · **Package:** player · **Size:** S
- **Depends on:** P5-13
- **Done when:** [ ] `<Player composition props>` and `<FrameView composition>`.

### P5-16 · Dev-mode determinism warnings
- **Type:** feat · **Package:** core · **Size:** S
- **Depends on:** P1-14
- **Done when:** [ ] dev builds warn on `Math.random`, `Date.now` and CSS animations inside clips; [ ] stripped from production builds.

### P5-17 · `kairon benchmark`
- **Type:** feat · **Package:** cli · **Size:** S
- **Depends on:** P5-02
- **Done when:** [ ] tries several concurrency values and recommends one.

### P5-18 · `kairon preview` app
- **Type:** feat · **Package:** `apps/preview`, cli · **Size:** L
- **Depends on:** P5-10, P5-15
- **Done when:** [ ] lists compositions and scene files; [ ] hot reload on file change; [ ] props panel generated from `propsSchema`.

### P5-19 · `kairon list`
- **Type:** feat · **Package:** cli · **Size:** S
- **Depends on:** P5-13
- **Done when:** [ ] lists project compositions with their settings.

### P5-20 · Benchmark suite and performance gate
- **Type:** test · **Package:** `tests/bench` · **Size:** M
- **Depends on:** P5-02
- **Done when:** [ ] reference scenes with timings tracked over time; [ ] 30 s 1080p30 < 30 s on the reference machine; [ ] regressions > 15 % flagged.

### P5-21 · Incremental export test
- **Type:** test · **Size:** S
- **Depends on:** P5-05
- **Done when:** [ ] 60 s scene; editing one 3 s text clip re-renders ≤ 3 chunks; [ ] output identical to a full render (frame hashes).

### P5-22 · Guide: code as clip types inside a scene
- **Type:** docs · **Size:** S
- **Depends on:** P5-11
- **Refs:** [13 — strategy 1](../13-incremental-rendering.md#1-code-as-clip-types-inside-a-scene-recommended-v10), [ADR 0009](../decisions/0009-scene-first.md)
- **Done when:** [ ] `docs/guides/custom-clip-types.md` with a full example; the recommended way to use code.
