# 0007 — MIT license

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Kairon Render is not meant to generate revenue. The goal is a fully owned,
freely usable engine that the Kairon editor and anyone else can build on.

## Decision

Release all Kairon Render packages under the MIT License. Only dependencies
with MIT-compatible licenses (MIT, ISC, BSD, Apache-2.0, 0BSD) are allowed;
CI enforces this with a license checker.

## Alternatives considered

- **Apache-2.0** — adds an explicit patent grant, but is longer and less
  familiar; MIT is the norm in the React ecosystem.
- **Business Source License** — only useful if we wanted to restrict
  commercial use, which we do not.
- **Proprietary** — blocks adoption and contributions.

## Consequences

- + Maximum adoption, simple for users and contributors.
- + No license friction for the Kairon editor or any other product.
- − Anyone, including competitors, can use or fork it commercially. Accepted.
- − We must never bundle GPL components (see [0008](0008-ffmpeg-not-bundled.md)).
