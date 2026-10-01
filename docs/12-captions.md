# 12 — Captions

Word-by-word animated captions, the style common in short-form video.

## Scope

Kairon **renders** captions from word timings it receives. It does not
transcribe, translate or decide which words to emphasize. The caller (an
editor, an AI pipeline) gets timings from a speech-to-text service and puts
them in the scene.

## Input: word timings

```jsonc
{
  "id": "subs", "type": "captions", "from": 0, "duration": 900,
  "props": {
    "words": [
      { "text": "Summer", "start": 0,   "end": 420 },
      { "text": "is",     "start": 420, "end": 560 },
      { "text": "here!",  "start": 560, "end": 1100, "emphasis": true }
    ],
    "preset": "pop",
    "position": { "x": 0.5, "y": 0.72 },
    "grouping": { "maxWords": 3 },
    "style": { "fontFamily": "Inter", "fontSize": 72, "activeColor": "#FFD400" }
  }
}
```

| Field | Meaning |
|-------|---------|
| `text` | The word, including attached punctuation. |
| `start`, `end` | **Milliseconds, relative to the clip start.** |
| `emphasis` | Optional. Rendered with the emphasis style. |

**Why milliseconds:** transcription services produce times, not frames, and
millisecond timings stay valid if the scene's fps changes. This is the only
place in the schema that uses milliseconds. At render time:
`frame = round(ms / 1000 * fps)`.

Validation: `start < end`, words sorted, no overlaps
(`KAIRON_E_CAPTION_OVERLAP`). Words outside the clip duration produce a
warning and are not shown.

## Grouping into pages

A **page** is the group of words shown on screen at once.
`groupWords(words, grouping)` splits words into pages, deterministically:

| Option | Default | Effect |
|--------|---------|--------|
| `maxWords` | 3 | Max words per page. |
| `maxChars` | 24 | Max characters per line. |
| `maxLines` | 1 | Lines per page (1–2). |
| `breakOnGapMs` | 500 | Start a new page after a pause this long. |
| `breakOnPunctuation` | true | Start a new page after `.` `?` `!`. |
| `lingerMs` | 300 | Keep the page visible after its last word, until the next page. |

`groupWords` is exported so an editor can show exactly the same pages in its
UI as the render.

## Word states and styling

Each word on the current page is in one of three states:

- `upcoming` — not spoken yet,
- `active` — being spoken now,
- `spoken` — already spoken.

Styles are set per state on top of a base style:

| Base | Per state (`upcoming*`, `active*`, `spoken*`) |
|------|-----------------------------------------------|
| `fontFamily`, `fontSize`, `fontWeight`, `textTransform`, `lineHeight`, `strokeColor`, `strokeWidth`, `shadow`, `box` (background, padding, radius) | `Color`, `BackgroundColor`, `Scale`, `Opacity` |

Example: `activeColor`, `upcomingOpacity`, `activeScale`. Emphasis words use
`emphasisColor` / `emphasisScale`.

## Presets

Presets are bundles of default style values; any field can be overridden.

| Preset | Effect |
|--------|--------|
| `plain` | Page appears; no word animation. |
| `highlight` | Active word changes color. |
| `box` | Active word gets a background pill. |
| `pop` | Active word scales up with a spring. |
| `karaoke` | A fill sweeps across each word over its duration. |
| `reveal` | Words appear one by one as they are spoken. |

`pageTransition`: `none` | `fade` | `slide-up` | `pop`, with a duration in
frames.

## Layout

- Position is normalized; text wraps within `maxWidth` (0–1, default 0.8).
- A default safe area keeps captions away from platform UI on vertical
  video (configurable).
- Layout is measured only after fonts load (behind a hold), so line breaks
  are identical in the player and the render.

## Importers

For sources that only have segment-level timings:

```ts
const cues = parseSrt(srtText);      // or parseVtt
const words = cuesToWords(cues);     // splits each cue across its words
```

`cuesToWords` spreads each cue's time across its words in proportion to
character count and marks them `"estimated": true`. Word-level transcription
gives much better results; adapters for specific transcription services live
in the caller, not in Kairon.

## React usage

```tsx
import { Captions } from "@kairon/captions";

<Captions words={words} preset="highlight" style={{ activeColor: "#00E0FF" }} />
```

## Out of scope

Transcription, translation, speaker diarization, automatic emphasis or
emoji insertion. These are caller responsibilities.
