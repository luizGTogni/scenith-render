# 0004 — FFmpeg for decoding, encoding and audio mixing

- **Status:** Accepted (distribution amended by [0008](0008-ffmpeg-not-bundled.md))
- **Date:** 2026-09-30

## Context

We need to decode source video frames exactly, encode many output formats,
and mix audio with sample accuracy.

## Decision

Use FFmpeg and ffprobe as external processes, communicating through pipes.
The renderer locates a system FFmpeg or uses a bundled binary per platform.

## Alternatives considered

- **WebCodecs in the browser** — great for client-side export later, but
  limited codecs and no audio mixing pipeline; not suitable as the server
  baseline.
- **Native bindings (libav via N-API)** — faster, but painful to build and
  distribute across platforms.

## Consequences

- + Every relevant format is supported.
- + Process isolation: an FFmpeg crash does not crash Node.
- − Licensing of the FFmpeg build must be managed (see
  [11 — Legal](../11-legal-and-clean-room.md)).
- − Process spawn and pipe overhead; mitigated by long-lived processes.
