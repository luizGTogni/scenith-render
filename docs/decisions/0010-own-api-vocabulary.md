# 0010 — Own API vocabulary

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The clean-room policy ([11](../11-legal-and-clean-room.md)) says Scenith is
not a clone of other engines, but the first API draft reused many of
Remotion's identifiers and signatures. That contradiction weakens the
clean-room position and makes Scenith look like a copy.

## Decision

Scenith's API is derived from its own model — scenes, tracks, clips,
keyframes — and names in code match names in the scene JSON.

- Generic industry vocabulary is allowed: composition, clip, track, layer,
  keyframe, easing, fps, codec, trim, speed, freeze frame.
- Identifiers coined by other engines are not used, even for similar
  concepts. The list is in [11 — Legal](../11-legal-and-clean-room.md#api-naming-policy).
- Signatures differ in shape, not only in name. Example: animation takes a
  keyframe list (`animate(frame, keyframes)`) — the same structure as the
  scene JSON — instead of parallel input/output range arrays.
- No compatibility layer or shims for other engines' APIs.

## Alternatives considered

- **Mirror an existing API for easy migration** — lowers switching cost but
  contradicts the clean-room policy and invites legal and reputational risk.

## Consequences

- + One vocabulary across JSON, React and docs; easier for humans and LLMs.
- + A credible independent implementation.
- − Developers coming from other engines must learn new names. A concept
  mapping guide (concepts only, no code) can be written later.
