# Phase 2 — Server rendering (MVP export)

**Goal:** `kairon render scene.json out.mp4` works with no project and no
build step.

**Exit criteria:** the Phase 1 scene renders to a correct MP4 with the
standard runtime; golden-frame tests run in CI; the same scene renders
identical frames twice.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| **Decisions** |||||
| P2-01 | ADR: color pipeline and output pixel format | adr | S | — | todo |
| P2-02 | ADR: minimum FFmpeg version and capability detection | adr | S | — | todo |
| P2-03 | Spike + ADR: frame capture method | spike | M | — | todo |
| P2-04 | ADR: Chromium version pinning and download | adr | S | — | todo |
| P2-05 | ADR: chunk grid size and segment encoding parameters | adr | S | P2-02 | todo |
| **Runtime** |||||
| P2-06 | Page bridge and rendering frame driver | feat | M | P1-15, P1-16 | todo |
| **Output** — `@kairon/renderer` |||||
| P2-07 | Browser management | feat | M | P2-04 | todo |
| P2-08 | FFmpeg locator and capability probe | feat | M | P2-02 | todo |
| P2-09 | Standard runtime build and local server | feat | M | P2-06 | todo |
| P2-10 | Capture loop and `captureFrame` abstraction | feat | M | P2-03, P2-07, P2-09 | todo |
| P2-11 | Scene input: validate in Node and load | feat | S | P2-09 | todo |
| P2-12 | Chunk grid planner and segment encoder (H.264) | feat | M | P2-01, P2-05, P2-08 | todo |
| P2-13 | Assemble: concat, atomic write, cleanup | feat | S | P2-12 | todo |
| P2-14 | `renderVideo` (single worker), progress, cancellation | feat | M | P2-10, P2-11, P2-13 | todo |
| P2-15 | `renderImage` | feat | S | P2-10, P2-11 | todo |
| **Interface** — `@kairon/cli` |||||
| P2-16 | CLI skeleton and `kairon.config.ts` loading | feat | M | P0-04 | todo |
| P2-17 | `kairon render`, `image`, `validate` | feat | M | P2-14, P2-15, P2-16 | todo |
| **Verification** |||||
| P2-18 | Visual regression harness | test | L | P2-14 | todo |
| P2-19 | Determinism test | test | S | P2-14 | todo |
| P2-20 | Getting started guide | docs | S | P2-17 | todo |

> Note: `kairon schema` moved to Phase 4 (P4-14) because it needs
> `toJsonSchema()`, which is built there.

---

## Decisions

### P2-01 · ADR: color pipeline and output pixel format
- **Type:** adr · **Size:** S
- **Why:** browsers draw in sRGB; video is usually BT.709 YUV. Wrong tags cause washed-out or shifted colors between players.
- **Decide:** conversion path (RGB → `yuv420p` BT.709, limited range), color metadata tags written to the file, behavior for `png`/alpha outputs, how golden tests compare colors.
- **Done when:** [ ] ADR accepted; [05](../05-rendering-pipeline.md#8-encode) updated.

### P2-02 · ADR: minimum FFmpeg version and capability detection
- **Type:** adr · **Size:** S
- **Refs:** [ADR 0008](../decisions/0008-ffmpeg-not-bundled.md)
- **Decide:** minimum supported FFmpeg major version; which version CI tests against; how `-version`/`-encoders`/`-filters` output is parsed; error codes for missing encoders/filters.
- **Done when:** [ ] ADR accepted.

### P2-03 · Spike + ADR: frame capture method
- **Type:** spike · **Size:** M (time-box 3 days)
- **Depends on:** — (uses a throwaway `puppeteer-core` script, not P2-07)
- **Refs:** [05 — capture loop](../05-rendering-pipeline.md#7-capture-loop-per-chunk)
- **Do:** benchmark `Page.captureScreenshot` vs `HeadlessExperimental.beginFrame`, JPEG vs PNG, at 1080p and 4K; check determinism of each.
- **Done when:** [ ] results table committed under `tests/bench/`; [ ] ADR picks the default.

### P2-04 · ADR: Chromium version pinning and download
- **Type:** adr · **Size:** S
- **Refs:** [ADR 0001](../decisions/0001-react-and-headless-chromium.md)
- **Decide:** `chrome-headless-shell` version pinned per Kairon release; download location and cache dir; supported platforms; offline/air-gapped option (`browserPath`); upgrade policy.
- **Done when:** [ ] ADR accepted.

### P2-05 · ADR: chunk grid size and segment encoding parameters
- **Type:** adr · **Size:** S
- **Depends on:** P2-02
- **Refs:** [05 — chunk grid](../05-rendering-pipeline.md#6-plan-the-chunk-grid), [13](../13-incremental-rendering.md)
- **Decide:** default chunk size; keyframe interval and closed GOP settings so segments concat without re-encode; B-frames at boundaries; how the encoder fingerprint is computed; container for segments.
- **Done when:** [ ] ADR accepted; concat of independently encoded segments verified to play without glitches in 3 players.

## Runtime

### P2-06 · Page bridge and rendering frame driver
- **Type:** feat · **Package:** core · **Size:** M
- **Depends on:** P1-15, P1-16
- **Refs:** [03 — page bridge](../03-architecture.md#the-page-bridge)
- **Done when:**
  - [ ] `window.__KAIRON__` with `protocol`, `listCompositions`, `load`, `seek`, `collectAssets`.
  - [ ] `seek` resolves only after React commit and all holds released.
  - [ ] Protocol mismatch between renderer and runtime fails with a clear error.

## Output

### P2-07 · Browser management
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-04
- **Done when:**
  - [ ] Downloads/locates `chrome-headless-shell`; launches via `puppeteer-core`.
  - [ ] Page viewport and `deviceScaleFactor` from settings and `scale`.
  - [ ] Console and page errors forwarded to logs with the current frame.

### P2-08 · FFmpeg locator and capability probe
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-02
- **Refs:** [ADR 0008](../decisions/0008-ffmpeg-not-bundled.md)
- **Done when:**
  - [ ] Resolution order: option → `KAIRON_FFMPEG_PATH`/`KAIRON_FFPROBE_PATH` → `PATH`.
  - [ ] `KAIRON_E_FFMPEG_NOT_FOUND` with install hints for Linux, macOS, Windows, Docker.
  - [ ] Version and encoder list probed once and cached; missing encoder → clear error.

### P2-09 · Standard runtime build and local server
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-06
- **Refs:** [03 — runtime bundles](../03-architecture.md#runtime-bundles)
- **Done when:**
  - [ ] Standard runtime (core + schema/react + built-ins + bridge) built during the package build into `renderer/runtime/`.
  - [ ] Local HTTP server on a free port serves the runtime and `/public`.

### P2-10 · Capture loop and `captureFrame` abstraction
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-03, P2-07, P2-09
- **Done when:** [ ] seeks and captures every frame of a range; [ ] capture method from P2-03 behind `captureFrame`; [ ] hold timeout fails with the hold label and frame.

### P2-11 · Scene input: validate in Node and load
- **Type:** feat · **Package:** renderer · **Size:** S
- **Depends on:** P2-09
- **Done when:** [ ] invalid scenes fail before any browser starts; [ ] normalized scene sent to `__KAIRON__.load`.

### P2-12 · Chunk grid planner and segment encoder (H.264)
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-01, P2-05, P2-08
- **Done when:**
  - [ ] Frames split into the fixed grid from P2-05 (single worker for now).
  - [ ] One FFmpeg process per chunk reading from stdin; `quality: { crf } | { bitrate }`.
  - [ ] Color tags from P2-01 applied.

### P2-13 · Assemble: concat, atomic write, cleanup
- **Type:** feat · **Package:** renderer · **Size:** S
- **Depends on:** P2-12
- **Done when:** [ ] concat demuxer without re-encode; [ ] temp file + rename; [ ] temp dir removed unless `keepTemp`.

### P2-14 · `renderVideo` (single worker), progress, cancellation
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-10, P2-11, P2-13
- **Done when:** [ ] public `renderVideo` per [09](../09-api-design.md#kaironrenderer-node) for scene sources; [ ] `onProgress`; [ ] `AbortSignal` kills all child processes and cleans up.

### P2-15 · `renderImage`
- **Type:** feat · **Package:** renderer · **Size:** S
- **Depends on:** P2-10, P2-11
- **Done when:** [ ] PNG, JPEG, WebP output of any frame.

## Interface

### P2-16 · CLI skeleton and `kairon.config.ts` loading
- **Type:** feat · **Package:** cli · **Size:** M
- **Depends on:** P0-04
- **Done when:** [ ] argument parsing, `--log` levels, exit codes; [ ] loads `kairon.config.ts` (TS loader) with `defineConfig`; [ ] CLI flags override config.

### P2-17 · `kairon render`, `image`, `validate`
- **Type:** feat · **Package:** cli · **Size:** M
- **Depends on:** P2-14, P2-15, P2-16
- **Done when:** [ ] commands per [09 — CLI](../09-api-design.md#kaironcli) for scene files; [ ] progress bar; [ ] `validate` prints errors with paths and exits non-zero.

## Verification

### P2-18 · Visual regression harness
- **Type:** test · **Package:** `tests/visual` · **Size:** L
- **Depends on:** P2-14
- **Done when:**
  - [ ] Reference scenes rendered to PNG at chosen frames, compared to committed golden images with a tolerance.
  - [ ] Diff images uploaded as CI artifacts on failure.
  - [ ] CI job uses the pinned Chromium and a pinned FFmpeg.

### P2-19 · Determinism test
- **Type:** test · **Size:** S
- **Depends on:** P2-14
- **Done when:** [ ] same scene rendered twice → identical frame hashes; runs in CI.

### P2-20 · Getting started guide
- **Type:** docs · **Size:** S
- **Depends on:** P2-17
- **Done when:** [ ] `docs/guides/getting-started.md`: install Node + FFmpeg, write a scene, render it.
