# 05 — Rendering Pipeline

How `kairon render scene.json out.mp4` turns a scene into a video file.

## Overview

```
 1. Resolve     read input (scene or composition), validate, normalize
 2. Runtime     pick the standard runtime, or build the project bundle (cached)
 3. Serve       local HTTP server for the runtime + media frame server
 4. Launch      pool of headless Chromium pages
 5. Load        load the scene/composition in each page
 6. Plan        split frames into a fixed chunk grid, skip cached chunks
 7. Capture     workers take chunks: seek → wait for holds → screenshot
 8. Encode      FFmpeg encodes each chunk as an independent segment
 9. Audio       mix all audio, normalize loudness
10. Assemble    concat segments, mux audio, write output, clean up
```

## 1. Resolve

- Input is either a scene (`{ scene, build? }`) or a composition of a
  project (`{ build, composition, props }`).
- Scenes are validated and normalized **in Node** with `@kairon-render/schema`
  before any browser starts, so invalid input fails fast with scene paths.

## 2–3. Runtime and serving

- Scenes that only use built-in clip types use the **standard runtime**
  shipped inside `@kairon-render/renderer`. No build step.
- Projects with custom clip types or code compositions are built by
  `@kairon-render/bundler` into a project bundle, cached by content hash.
- A local HTTP server (random free port) serves:
  - the runtime (`/`),
  - public assets (`/public/*`),
  - the **media frame server** (`/__kairon/media/*`), see [07](07-media-and-assets.md).

## 4. Browser pool

- Uses `chrome-headless-shell` driven over CDP (via `puppeteer-core`).
- Pool size = `concurrency` option (default: `cpuCount / 2`).
- Each page gets the composition's exact viewport and `deviceScaleFactor`
  (`scale` option for supersampling).
- Flags disable background throttling and other sources of nondeterminism.
- Console messages and page errors are forwarded to Node logs with the
  current frame number.

## 5. Load

```ts
await page.evaluate((src) => __KAIRON__.load(src), source);
```

For code compositions: validate props against `propsSchema`, run
`resolve()`, and return the final settings to Node.

## 6. Plan: the chunk grid

Frames are split into a **fixed grid** of chunks (default size: 2 seconds
of frames, e.g. 60 at 30 fps):

```
900 frames, chunk size 60  →  chunk 0 = 0..59, chunk 1 = 60..119, ... chunk 14 = 840..899
```

- The grid is fixed (not "one chunk per worker") so the same frames always
  belong to the same chunk. That is what makes chunk caching possible.
- Each chunk has a **key** computed from what is visible in it. Chunks
  whose key is already in the cache are skipped.
  See [13 — Incremental Rendering](13-incremental-rendering.md).
- Remaining chunks go into a queue; workers pull from it. Sequential frames
  inside a chunk keep video decoding cheap.

## 7. Capture loop (per chunk)

```ts
for (let f = chunk.start; f <= chunk.end; f++) {
  await page.evaluate((f) => __KAIRON__.seek(f), f); // render + wait for holds
  const image = await captureFrame(page);            // JPEG or PNG buffer
  encoder.write(image);                              // FFmpeg stdin
}
```

- Hold timeout (default 30 s) fails the render with the hold's label.
- Capture format: `jpeg` (fast, default for opaque video) or `png` (needed
  for transparency and PNG sequences).
- `captureFrame` is abstracted so we can choose between
  `Page.captureScreenshot` and `HeadlessExperimental.beginFrame` from
  benchmarks.

## 8. Encode

Each chunk is encoded as an **independent segment**: it starts on a
keyframe and uses exactly the same encoder parameters as every other chunk,
so segments can be concatenated without re-encoding.

```
ffmpeg -f image2pipe -framerate 30 -i - -c:v libx264 -pix_fmt yuv420p -crf 18 chunk-0007.mp4
```

| Format | Video codec | Audio codec | Transparency |
|--------|-------------|-------------|--------------|
| MP4 | H.264, H.265 | AAC | No |
| WebM | VP8, VP9 | Opus | Yes (VP8/VP9) |
| MOV | ProRes | PCM / AAC | Yes (ProRes 4444) |
| GIF | — | — | 1-bit |
| PNG sequence | — | — | Yes |

Quality: `quality: { crf }` or `quality: { bitrate }`. Hardware encoders
(NVENC, VideoToolbox, VAAPI) are opt-in. The available encoders depend on
the user's FFmpeg build, checked at startup.

## 9. Audio

Audio is **not** captured from the browser.

1. During capture, each worker calls `collectAssets()` per frame: which
   audio/video sources are active, their source time, volume and speed.
2. For scenes, Node can also derive this directly from the normalized scene
   (needed when all visual chunks come from the cache).
3. FFmpeg builds one mixed track (`filter_complex`: trim, delay, volume
   curves, `atempo`, `amix`).
4. **Loudness normalization** (optional) runs on the final mix.

Audio is always mixed for the full video, even in incremental renders: it
is cheap, and loudness must be measured on the whole mix.

### Loudness normalization

```ts
audio: { loudness: "streaming" }                         // preset
audio: { loudness: { integrated: -14, truePeak: -1 } }   // custom
audio: { loudness: false }                               // default: keep the mix as authored
```

| Preset | Integrated | True peak | Use |
|--------|------------|-----------|-----|
| `streaming` | −14 LUFS | −1 dBTP | YouTube, TikTok, Instagram, Spotify |
| `podcast` | −16 LUFS | −1 dBTP | Podcasts, voice content |
| `broadcast` | −23 LUFS | −1 dBTP | EBU R128 broadcast |

Implementation: FFmpeg `loudnorm` in two passes — pass 1 measures the mix
(`print_format=json`), pass 2 applies the measured values in linear mode,
so the mix is scaled evenly instead of dynamically compressed. The measured
values are returned in the render result.

Per-source normalization (evening out voice vs. music before mixing) is a
later feature.

## 10. Assemble

1. Concatenate all segments (new and cached) with the FFmpeg concat demuxer.
2. Mux the mixed audio track.
3. Write the output atomically (temp file + rename).
4. Store new segments in the chunk cache.
5. Close browsers, stop servers, delete temp files (unless `--keep-temp`).

## Progress and cancellation

```ts
onProgress({ stage, renderedFrames, totalFrames, chunksReused, chunksTotal, etaMs })
```

`renderVideo` accepts an `AbortSignal`. Cancelling kills FFmpeg and browser
processes and cleans temp files.

## Single images

`renderImage` skips encoding: load, seek one frame, capture PNG/JPEG/WebP.
Used for thumbnails and posters.

## Future: distributed rendering

Chunks are already independent units with stable keys, so they can run on
different machines: a coordinator plans the grid, workers run
`renderChunk()` and upload segments, the coordinator assembles. This lives
in a future `@kairon-render/cloud` package.
