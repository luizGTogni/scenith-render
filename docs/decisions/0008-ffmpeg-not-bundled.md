# 0008 — FFmpeg is required but never bundled

- **Status:** Accepted
- **Date:** 2026-09-30
- **Amends:** [0004](0004-ffmpeg-for-encoding.md) (distribution only)

## Context

The renderer depends on FFmpeg (ADR 0004). FFmpeg builds that include the
best encoders (`libx264`, `libx265`) are GPL. Distributing those binaries
inside an MIT package would bring GPL obligations into Kairon releases.

GPL obligations apply to whoever **distributes** the binaries. Invoking a
separate program through its command line does not make Kairon a derivative
work of it.

## Decision

- Kairon packages never include or depend on FFmpeg binaries.
- The renderer runs `ffmpeg` and `ffprobe` as separate processes only.
- Resolution order: `ffmpegPath` / `ffprobePath` options →
  `KAIRON_FFMPEG_PATH` / `KAIRON_FFPROBE_PATH` env vars → system `PATH`.
- If not found, fail with `KAIRON_E_FFMPEG_NOT_FOUND` and per-OS install
  instructions.
- On startup the renderer reads `ffmpeg -version` / `-encoders` to check the
  minimum version and which encoders exist, and reports a clear error when a
  requested codec is missing (e.g. `libx264` in an LGPL-only build).
- An official Dockerfile example uses `FROM` a distro image and installs
  FFmpeg through the package manager at build time; we do not publish a
  prebuilt image containing FFmpeg.

## Alternatives considered

- **Bundle an LGPL build** — legal to ship, but without `libx264`; H.264
  output would rely on weaker encoders (OpenH264) or none.
- **Bundle a GPL build** — forces GPL obligations onto every release.
- **Depend on `ffmpeg-static`** — still ships GPL binaries through our
  dependency tree.

## Consequences

- + Kairon stays 100 % MIT; no license obligations for us.
- + Users choose and update their own FFmpeg (security fixes, GPU encoders).
- − One extra install step; mitigated by clear errors and docs.
- − Behavior can vary between FFmpeg versions; we define a minimum version
  and test against it in CI.
