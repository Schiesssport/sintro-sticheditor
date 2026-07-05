# AGENTS.md

Overview for AI agents working in this repo.

## What this is

Editor + program list for the **Stiche** (shooting programs) of the SINTRO
Trefferanzeige, 300 m. The device stores programs in a binary `.dat` file of
fixed **328-byte records**. This repo edits them via a JSON intermediate, a
browser app, and a Node CLI. A readable Markdown list is the authoring source
for the standard programs.

## Layout (flat, at repo root)

- `sticheditor.js` — core lib + Node CLI. `.dat` ⇄ JSON, validation, the JSON
  envelope. Pure ES module, no runtime deps. (Exports listed under *Core
  functions* below.)
- `index.html` — browser editor (imports `sticheditor.js`; served over HTTP).
  Holds the UI translations; all UI text is English in source.
- `program.schema.json` — JSON Schema for the program list.
- `programme_300m_ch.json` — the program list (authoritative source).
- `programme_300m_ch.dat` — device file, generated from the JSON.
- `stichliste_300m_ch.md` — human-readable reference of the standard programs.
- `serve.js` — dev server. `manifest.webmanifest` / `sw.js` / `icon.svg` — PWA.
- `build-singlefile.js` — inlines the app into one self-contained `.html`.
- `.github/workflows/deploy.yml` — on release: deploy Pages + attach single file.
- `programme_300m_ch_UNTERBACH.json` — **ignore.** Club-internal, git-ignored.

## Commands

Node.js (v24); no dependencies (`package.json` has scripts only, `npm install`
does nothing). Node auto-detects ES module syntax — don't add a bundler.

```bash
npm run dev                               # dev server, http://localhost:8000
npm run build                             # → sintro-sticheditor.html (single file)
node sticheditor.js dat-to-json in.dat out.json
node sticheditor.js json-to-dat in.json out.dat   # validates first
```

## The pipeline

```
.dat (binary)  ⇄  program objects  ⇄  JSON envelope (files / sessionStorage / clipboard)
              DatParser          wrap/unwrapPrograms
```

Both the browser app and the CLI go through `sticheditor.js`. The browser edits
program objects in memory, mirrors them into `sessionStorage`, and serializes
back to a `.dat` on export.

## Core functions (`sticheditor.js`)

- `importDat(arrayBuffer, jsonPath?)` → `{ programs, validationErrors }` — parse
  a `.dat`, validate, persist as JSON (Node) / sessionStorage (browser).
- `exportDat(jsonPath?)` → `ArrayBuffer` — load, validate (throws with
  `.validationErrors` if invalid), serialize to `.dat`.
- `serializePrograms(programs)` → `ArrayBuffer` — objects → `.dat` bytes.
- `validateProgram(prog)` → `[{ code, params }]` — VBA-derived rules. Returns
  **structured error objects**, not strings, so callers can localize them.
- `formatValidationError(err, lang)` → string — render one error via
  `VALIDATION_MESSAGES[lang]` (`en`/`de`/`fr`; falls back to `en`). CLI uses `en`.
- `wrapPrograms(programs)` / `unwrapPrograms(data)` — build/read the envelope.
- `createProgram(prgNum)` — new program with safe defaults.
- `defaultStepInfo(step)` — derived per-step label (e.g. `A5-P100`); the
  empty-`info` fallback at serialize time and the editor placeholder.

## JSON envelope

The list is a self-identifying, versioned envelope — `{ "format":
"sintro-programs", "version": 1, "programs": [ … ] }` — shared by the files, the
CLI, sessionStorage, and clipboard copy/paste. `wrap`/`unwrapPrograms` in
`sticheditor.js` produce/read it. Schema: `program.schema.json`. There is no
legacy bare-array support.

## Data model

A program: `prgNum` (1–999), `title` (≤28 chars, bare — the `.dat` stores it
as `"NNN " + title`), `internalId` (≤8), print/weapon/spare fields, and exactly
**8 `steps`**. A step: `shotNum`, `info` (≤8), `sil` (letter), `calc` (≠0),
`fireMethod` (A–Z), `printMode`, `stepTime1`, `calcHighscore` (0/1),
`position` (0=prone/1=kneeling/2=standing), `breakNotAllowed` (0/1).

Hard rules (see schema + `ProgramValidator`):
- Exactly 8 steps; active first (`shotNum>0`), then inactive. **No gaps** once
  a step has `shotNum=0`.
- Inactive steps still need valid placeholder values in every field.
- Strings are Latin-1; codepoints >255 are rejected/sanitized.
- `position` is 0/1/2 in JSON but 1/3/4 on disk (parser translates); the VBA
  field is misleadingly named `FireMode`.
- A leading "probe frei" is NOT a separate step — it's `breakNotAllowed=0` on
  the first active step.

The full 328-byte record layout is documented in the comment above `DatParser`
in `sticheditor.js` — read it before touching read/write offsets.

## Change tracking (`index.html`)

Each in-memory program carries a runtime `_uid` (stripped by the serializer and
by `stableStringify`). A `baseline` map (`_uid` → canonical JSON of the last
imported/exported "clean" state) lets the UI derive per-program status —
`''` unchanged, `new`, `changed` — and whether the list has unexported changes
(the dirty badge). `captureBaseline()` runs on import and export. `ensureUids()`
assigns ids and advances past stale baseline ids so a cleared-then-re-added
program never reuses an old id (which would mislabel it "changed").

## Internationalization (`index.html`)

UI language is `en` / `de` / `fr`, defaulting to the browser language and
persisted in `localStorage['sintro_lang']`. A `<select id="lang-select">`
switches it live.

- **UI chrome** lives in the `UI = { en, de, fr }` dictionary in `index.html`.
  `t(key, params)` renders a string (`{name}` placeholders). Static markup uses
  `data-i18n` (textContent), `data-i18n-title`, `data-i18n-placeholder`, and
  `data-i18n-stage` (numbered stage headers); `applyStaticTranslations()`
  applies them. Dynamic strings (status, counts, dialog titles) call `t()`.
- **Validation messages** live in `sticheditor.js` (`VALIDATION_MESSAGES`,
  rendered by `formatValidationError`) so the CLI and app share one source.
- Adding UI text: add the key to all three languages in `UI`, then reference it
  via `data-i18n*` (static) or `t()` (dynamic).

## Gotchas

- **`data-i18n` sets `textContent`, which wipes child elements.** Never put it
  on an element that wraps functional children (e.g. a `<label>` around a file
  `<input>`). Translate an inner `<span>` instead. (Use `data-i18n-title` /
  `-placeholder` when only an attribute should change.)
- Round-tripping `.dat`→JSON→`.dat` changes only `passeProgress` (spaces vs "")
  — cosmetic, identical bytes on disk.
- Calibration programs (printFormat `X`, e.g. the old 997–998) are verbatim
  device programs; the SINTRO conventions below do NOT apply to them. They are
  not part of the current standard list.
- Always validate (`json-to-dat` does) before trusting a `.dat`.

## Source of truth

`programme_300m_ch.json` is authoritative. Edit it directly or via the web app,
then regenerate the `.dat` with `json-to-dat`. `stichliste_300m_ch.md` is a
human-readable reference of the standard programs (it also documents the
conventions below). All derived fields are already baked into the JSON — the
only rule that stays runtime is `defaultStepInfo`, which fills an empty `info`
at serialize time.

## SINTRO conventions (already baked into the JSON)

The Markdown reference uses a step shorthand `<sil><calc><fireMethod><shotNum>`
(e.g. `A5P100`, `B4S3`; `P+` prefix = probe frei → `breakNotAllowed=0`;
`shotNum=100` = unlimited). These conventions produced the current JSON:

- **"ohne Druck"** program → `breakNotAllowed=0` (a break is a non-printing probe).
- **printMode**: probe steps (`P`) → `N`; other steps → `P`, but → `G` if it's
  the only active non-probe step.
- **calcHighscore** (Tiefschuss) = 1 on Serie (`S`) steps, except Feldschiessen,
  Feldstich, and OP programs.
- **printFormat** default `Z` (`r`/`l` for Feldschiessen/OP).
- **info** may be empty; derived at serialize (`A5-P100`; dash dropped if >8).
- **internalId** = `SIUS` + zero-padded SIUS program number (unused as ID,
  never displayed).

## Distribution

Two channels, both from the same source (`deploy.yml`, on release):
- **GitHub Pages** — the multi-file PWA (installable, offline via `sw.js`).
- **Single-file** — `build-singlefile.js` inlines `sticheditor.js` and strips
  the PWA markup (between `<!-- PWA:START/END -->` markers) and the Node CLI
  tail, producing a `file://`-openable `.html` attached to the release.
  Keep the app import-inlinable and the PWA markers intact.

## License

GNU AGPL-3.0.
