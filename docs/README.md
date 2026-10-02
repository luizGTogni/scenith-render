# Scenith Render — Documentation

This folder is the single source of truth for the design of Scenith Render.
Read the documents in order the first time; afterwards use them as reference.

## Reading order

| #  | Document | What it answers |
|----|----------|-----------------|
| 01 | [Vision](01-vision.md) | Why does Scenith exist, who is it for, what is out of scope? |
| 02 | [Core Concepts](02-core-concepts.md) | What are compositions, frames, clips and the timeline? |
| 03 | [Architecture](03-architecture.md) | How do the pieces fit together end to end? |
| 04 | [Packages](04-packages.md) | How is the monorepo organized and what does each package own? |
| 05 | [Rendering Pipeline](05-rendering-pipeline.md) | How does a composition become an MP4? |
| 06 | [Player](06-player.md) | How is a composition previewed in the browser? |
| 07 | [Media and Assets](07-media-and-assets.md) | How are video, audio, images and fonts handled? |
| 08 | [Scene Schema](08-scene-schema.md) | What is the JSON scene format — Scenith's primary input? |
| 09 | [API Design](09-api-design.md) | What does the public API look like? |
| 10 | [Roadmap](10-roadmap.md) | In what order do we build things? |
| 11 | [Legal and Clean Room](11-legal-and-clean-room.md) | How do we stay independent from Remotion? |
| 12 | [Captions](12-captions.md) | How are word-by-word captions rendered? |
| 13 | [Incremental Rendering](13-incremental-rendering.md) | How does re-export only render what changed? |
| —  | [Glossary](glossary.md) | Definitions of every term used in these docs. |
| —  | [Tasks](tasks/README.md) | The roadmap broken into ordered, one-PR tasks. |

## Architecture Decision Records

Significant technical decisions live in [`decisions/`](decisions/). Each record
is short, numbered and immutable once accepted — to change a decision, write a
new record that supersedes the old one.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](decisions/0001-react-and-headless-chromium.md) | React + headless Chromium as the rendering model | Accepted |
| [0002](decisions/0002-monorepo-tooling.md) | Monorepo with pnpm, Turborepo and TypeScript | Accepted |
| [0003](decisions/0003-vite-as-bundler.md) | Vite as the bundler | Accepted |
| [0004](decisions/0004-ffmpeg-for-encoding.md) | FFmpeg for decoding, encoding and audio mixing | Accepted |
| [0005](decisions/0005-json-scene-schema.md) | A JSON scene schema as the AI and editor contract | Accepted |
| [0006](decisions/0006-server-first-export.md) | Server-side export first, client-side export later | Accepted |
| [0007](decisions/0007-mit-license.md) | MIT license | Accepted |
| [0008](decisions/0008-ffmpeg-not-bundled.md) | FFmpeg is required but never bundled | Accepted |
| [0009](decisions/0009-scene-first.md) | Scene first, code to extend | Accepted |
| [0010](decisions/0010-own-api-vocabulary.md) | Own API vocabulary | Accepted |

## Conventions

- All documentation and code is written in **English**.
- Docs are Markdown, one topic per file, kept short. If a file grows past
  ~400 lines, split it.
- Code samples are TypeScript + React and illustrate *intended* APIs; they may
  change until the API is frozen in v1.0.
- When a doc and the code disagree after implementation starts, fix the doc in
  the same pull request.
