# 11 — Legal and Clean Room

Kairon Render competes in the same space as Remotion. Remotion is
source-available under a license that restricts commercial use. To keep
Kairon fully owned and freely licensable, it must be an **independent
implementation**.

> This document is engineering policy, not legal advice. Have a lawyer
> review the license choice and this policy before the public release.

## What is fine

- General ideas and techniques that are widely known: rendering React in a
  headless browser, frame-based animation, using FFmpeg, chunked parallel
  rendering. Ideas are not protected by copyright.
- Reading **public documentation** and using the products to understand
  user-facing behavior.
- Using common industry vocabulary (frame, composition, fps, codec).
- Using open-source dependencies whose licenses allow it (MIT, Apache-2.0,
  BSD, LGPL for FFmpeg when dynamically invoked as a binary).

## What is not allowed

- Copying, translating or adapting source code from Remotion or other
  restricted-license projects — including tests, types and comments.
- Reading their source code while implementing the equivalent Kairon
  feature. If a contributor has studied that code in depth, someone else
  should implement the matching feature from the Kairon spec.
- Using the Remotion name, logo or branding in Kairon's product, package
  names or marketing in a way that suggests affiliation.
- Mirroring another engine's API. Kairon's API follows its own vocabulary;
  see [API naming policy](#api-naming-policy).

## API naming policy

Kairon's API is derived from its own model — scenes, tracks, clips and
keyframes — and code names match JSON names
([ADR 0010](decisions/0010-own-api-vocabulary.md)).

- **Allowed:** generic industry vocabulary — composition, clip, track,
  layer, keyframe, easing, fps, codec, trim, speed, freeze frame, frame.
- **Not used:** identifiers coined by other engines, even when the concept
  is similar. From Remotion's public API, for example: `useCurrentFrame`,
  `useVideoConfig`, `durationInFrames`, `interpolate`, `interpolateColors`,
  `Easing`, `AbsoluteFill`, `Sequence`, `Series`, `Loop`, `Freeze`,
  `TransitionSeries`, `delayRender` / `continueRender`, `staticFile`,
  `registerRoot`, `calculateMetadata`, `renderMedia`, `renderStill`,
  `selectComposition`, `OffthreadVideo`, `Img`, `startFrom` / `endAt`,
  `playbackRate`.
- **Shapes differ too:** e.g. `animate(frame, keyframes)` with keyframe
  objects, instead of parallel input/output range arrays.
- Code review checks every new public name against this list. When in
  doubt, use the term the scene JSON would use.

## Process

1. **Spec first.** Features are implemented from the documents in this
   folder, not from other codebases.
2. **Provenance in PRs.** Pull requests that implement a core feature state
   the sources used (specs, public docs, papers, standards).
3. **Dependency audit.** CI runs a license checker; only allow-listed
   licenses can be added.
4. **No bundled FFmpeg.** Kairon never ships FFmpeg binaries. See
   [FFmpeg](#ffmpeg) below.

## Kairon's own license: MIT

Kairon Render is released under the [MIT License](../LICENSE)
(see [ADR 0007](decisions/0007-mit-license.md)). Anyone may use, modify and
sell software built with it, including competitors. That is intended: Kairon
is not a revenue source, adoption and contributions are the goal.

Every `package.json` declares `"license": "MIT"`, and only dependencies with
MIT-compatible licenses (MIT, ISC, BSD, Apache-2.0, 0BSD) may be added.

## FFmpeg

FFmpeg is LGPL, and common encoders like `libx264`/`libx265` are GPL. The
GPL obligations are triggered by **distributing** those binaries, not by
using them. So Kairon does not distribute them
(see [ADR 0008](decisions/0008-ffmpeg-not-bundled.md)):

- Kairon's code never links to FFmpeg; it runs `ffmpeg`/`ffprobe` as
  separate processes and talks to them through pipes and command-line
  arguments. Kairon stays pure MIT.
- The renderer looks for FFmpeg in this order: `ffmpegPath` option /
  `KAIRON_FFMPEG_PATH` env var → `ffmpeg` on the system `PATH`. If none is
  found, it fails with `KAIRON_E_FFMPEG_NOT_FOUND` and install instructions.
- The user installs FFmpeg themselves (`apt install ffmpeg`,
  `brew install ffmpeg`, `winget install ffmpeg`, or the official Docker
  images). The license of that build is between the user and FFmpeg.
- Docs may point to third-party packages that ship binaries (e.g.
  `ffmpeg-static`), but Kairon packages must not depend on them.

Running a GPL FFmpeg on your own servers (e.g. the editor's render backend)
is not distribution, so the editor can use a full build with `libx264`
without any license effect on its own code.

## Trademark

Check availability of "Kairon" / "Kairon Render" for software in the target
markets and register the name and npm scope (`@kairon`) early.
