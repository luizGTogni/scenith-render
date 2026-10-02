# Glossary

| Term | Definition |
|------|------------|
| **Asset** | A media file (video, audio, image, font) referenced by id in a scene. |
| **Asset fingerprint** | Content hash of an asset, used in chunk keys. |
| **Asset usage registry** | Runtime list of media active on each frame, used for audio mixing. |
| **CDP** | Chrome DevTools Protocol, used by Node to control headless Chromium. |
| **Chunk** | A fixed range of frames in the chunk grid, rendered and encoded as one segment. |
| **Chunk key** | Hash of everything that can affect a chunk's pixels; used to reuse cached segments. |
| **Chunk store** | Storage for encoded chunk segments (local directory or custom `ChunkStore`). |
| **Clip** | A timeline element with `from`, `duration`, a clip type and props. |
| **Clip type** | The component that renders a clip: built-in (`text`, `video`, `captions`, ...) or custom (`custom:<name>`). |
| **Composition** | A named, renderable video in a project: a scene or a React component plus settings. |
| **CRF** | Constant Rate Factor; an encoder quality setting (lower = better quality, larger file). |
| **Determinism** | The property that the same frame and props always render the same pixels. |
| **Easing** | The shape of motion between two keyframes (named curve, cubic Bézier or spring). |
| **Environment** | Where components run: `player`, `rendering` or `preview`. |
| **fps** | Frames per second. |
| **Frame** | A single image of the video, identified by an integer starting at 0. |
| **Frame driver** | The part that decides which frame is current (player clock or renderer). |
| **Hold** | A signal that a frame is not ready yet; the renderer waits until all holds are released. |
| **Incremental rendering** | Re-rendering only the chunks whose key changed since the last export. |
| **Keyframe** | A `{ frame, value, easing }` point; values between keyframes are interpolated. |
| **Layer** | `<Layer>`: absolutely positioned, full-size container. Each track renders as a layer. |
| **LUFS** | Loudness Units relative to Full Scale; the unit used for loudness normalization. |
| **Media frame server** | Local Node HTTP service that returns exact video frames decoded with FFmpeg. |
| **Metadata** | Free-form JSON on scenes, tracks, clips and assets, preserved but never read by Scenith. |
| **Page (captions)** | A group of words shown on screen at the same time. |
| **Page bridge** | `window.__SCENITH__`, the API through which Node controls the runtime in the browser. |
| **Player** | `@scenith-render/player`, the in-browser real-time preview component. |
| **Project bundle** | Runtime built by `@scenith-render/bundler` that includes a project's custom clip types. |
| **Registry** | Set of custom clip types available to scenes. |
| **Scene** | A JSON document describing a full video; Scenith's primary input. |
| **Standard runtime** | Prebuilt runtime with all built-in clip types, shipped in `@scenith-render/renderer`. |
| **Track** | A layer in a scene that holds clips; later tracks draw on top. |
| **Visual slice** | The canonical JSON of the visual clips visible in a chunk; part of the chunk key. |
| **Word timing** | `{ text, start, end }` in milliseconds, the input of captions. |
