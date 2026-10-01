# Phase 3 — Media and audio

**Goal:** video and audio clips, in sync, in both player and render.

**Exit criteria:** a scene with two videos, music and a voiceover renders
with audio in sync (±1 frame) and matches the player; output with
`--loudness=streaming` measures −14 LUFS ±1 LU.

| ID | Title | Type | Size | Depends on | Status |
|----|-------|------|------|------------|--------|
| **Decisions** |||||
| P3-01 | ADR: media frame server protocol and decoder lifecycle | adr | S | — | todo |
| **Data model** |||||
| P3-02 | `video` and `audio` clip schemas | feat | S | P1-07 | todo |
| **Media services** — `@kairon/renderer` |||||
| P3-03 | Remote media cache and asset fingerprints | feat | M | P2-09 | todo |
| P3-04 | Media frame server | feat | L | P3-01, P2-08, P3-03 | todo |
| P3-05 | `probeMedia` in Node | feat | S | P2-08 | todo |
| **Runtime** — `@kairon/media` |||||
| P3-06 | `<Video>` in rendering mode | feat | M | P3-04, P2-06 | todo |
| P3-07 | `<Video>` and `<Audio>` in player mode | feat | L | P1-22 | todo |
| P3-08 | Asset usage reporting for `<Video>` and `<Audio>` | feat | M | P1-15 | todo |
| P3-09 | `video` and `audio` clip types | feat | M | P3-02, P3-06, P3-07, P3-08 | todo |
| P3-10 | `<Gif>` | feat | M | P1-14 | todo |
| P3-11 | `preload`, `publicUrl`, browser `probeMedia` | feat | S | P1-14 | todo |
| **Driver** — `@kairon/player` |||||
| P3-12 | Audio clock and autoplay handling | feat | M | P3-07 | todo |
| **Output: audio** — `@kairon/renderer` |||||
| P3-13 | Audio timeline from scene and from `collectAssets` | feat | M | P3-02, P3-08 | todo |
| P3-14 | Audio mixer | feat | L | P3-13 | todo |
| P3-15 | Loudness normalization | feat | M | P3-14 | todo |
| **Verification** |||||
| P3-16 | A/V sync and loudness tests | test | M | P3-14, P3-15, P3-09 | todo |

---

### P3-01 · ADR: media frame server protocol and decoder lifecycle
- **Type:** adr · **Size:** S
- **Refs:** [07 — renderer](../07-media-and-assets.md#renderer-frame-accurate)
- **Decide:** URL format; how time is mapped to a frame (timestamp, VFR); decoder pool size and idle timeout; frame cache size; output image format (JPEG vs PNG for alpha); behavior on seek backwards.
- **Done when:** [ ] ADR accepted.

### P3-02 · `video` and `audio` clip schemas
- **Type:** feat · **Package:** schema · **Size:** S
- **Depends on:** P1-07
- **Done when:** [ ] props: `asset`, `trimStart`, `trimEnd`, `volume`, `fadeIn`, `fadeOut`, `speed`, `loop`, `muted` (video), `fit` (video); [ ] trims validated against the clip duration and speed.

### P3-03 · Remote media cache and asset fingerprints
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P2-09
- **Refs:** [07 — asset identity](../07-media-and-assets.md#asset-identity)
- **Done when:** [ ] remote URLs downloaded once, revalidated by ETag/Last-Modified; [ ] fingerprint = content hash, or the scene's trusted `hash`.

### P3-04 · Media frame server
- **Type:** feat · **Package:** renderer · **Size:** L
- **Depends on:** P3-01, P2-08, P3-03
- **Done when:**
  - [ ] Implements the P3-01 protocol; one warm decoder per source, forward decoding.
  - [ ] Exact frame by timestamp, VFR sources handled; alpha sources return PNG.
  - [ ] Bounded memory (LRU) verified on a long 4K source.

### P3-05 · `probeMedia` in Node
- **Type:** feat · **Package:** renderer · **Size:** S
- **Depends on:** P2-08
- **Done when:** [ ] uses `ffprobe`; returns duration, size, fps, `hasVideo`, `hasAudio`.

### P3-06 · `<Video>` in rendering mode
- **Type:** feat · **Package:** media · **Size:** M
- **Depends on:** P3-04, P2-06
- **Done when:** [ ] in `rendering`, draws frames from the frame server behind a hold; [ ] source time follows [07](../07-media-and-assets.md#renderer-frame-accurate).

### P3-07 · `<Video>` and `<Audio>` in player mode
- **Type:** feat · **Package:** media · **Size:** L
- **Depends on:** P1-22
- **Done when:** [ ] native elements synced to the frame clock; [ ] drift > 1 frame corrected; [ ] paused seek waits for `seeked` via a hold.

### P3-08 · Asset usage reporting for `<Video>` and `<Audio>`
- **Type:** feat · **Package:** media · **Size:** M
- **Depends on:** P1-15
- **Done when:** [ ] every active frame reports an `AssetUsage` with source time, volume (number or function) and speed.

### P3-09 · `video` and `audio` clip types
- **Type:** feat · **Package:** schema (`/react`) · **Size:** M
- **Depends on:** P3-02, P3-06, P3-07, P3-08
- **Done when:** [ ] built-ins registered; [ ] fades become volume curves.

### P3-10 · `<Gif>`
- **Type:** feat · **Package:** media · **Size:** M
- **Depends on:** P1-14
- **Done when:** [ ] frames decoded (e.g. `ImageDecoder`) and selected by the timeline frame, not browser time.

### P3-11 · `preload`, `publicUrl`, browser `probeMedia`
- **Type:** feat · **Package:** media · **Size:** S
- **Depends on:** P1-14
- **Done when:** [ ] API per [09](../09-api-design.md#kaironmedia); [ ] browser `probeMedia` documents which fields it cannot provide (e.g. fps).

### P3-12 · Audio clock and autoplay handling
- **Type:** feat · **Package:** player · **Size:** M
- **Depends on:** P3-07
- **Done when:** [ ] `AudioContext` is master clock while audio plays; [ ] autoplay blocked → clear state and event, resume on user gesture.

### P3-13 · Audio timeline from scene and from `collectAssets`
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P3-02, P3-08
- **Refs:** [05 — audio](../05-rendering-pipeline.md#9-audio)
- **Done when:** [ ] for scenes, timeline derived in Node without a browser; [ ] for code, merged from per-frame `collectAssets`; [ ] both produce the same structure.

### P3-14 · Audio mixer
- **Type:** feat · **Package:** renderer · **Size:** L
- **Depends on:** P3-13
- **Done when:** [ ] `filter_complex` with trim, delay, volume curves, `atempo` chains, `amix` without auto-normalization; [ ] muxed into the output; [ ] audio codec/bitrate options.

### P3-15 · Loudness normalization
- **Type:** feat · **Package:** renderer · **Size:** M
- **Depends on:** P3-14
- **Refs:** [05 — loudness](../05-rendering-pipeline.md#loudness-normalization)
- **Done when:** [ ] presets `streaming`, `podcast`, `broadcast` and custom targets; [ ] two-pass `loudnorm` in linear mode; [ ] measurements in `RenderResult`; [ ] default off.

### P3-16 · A/V sync and loudness tests
- **Type:** test · **Size:** M
- **Depends on:** P3-14, P3-15, P3-09
- **Done when:**
  - [ ] Generated test media (flash + beep at known frames) detects A/V offset; must be ≤ 1 frame.
  - [ ] Loudness of `streaming` output measured with `ebur128`: −14 ±1 LUFS.
  - [ ] Phase exit scene (2 videos, music, voiceover) in `examples/scenes/`.
