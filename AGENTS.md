# AGENTS.md

Overview for AI agents working in this repo.

## What this is

Editor + program list for the **Stiche** (shooting programs) of the SINTRO
Trefferanzeige, 300 m. The device stores programs in a binary `.dat` file of
fixed **328-byte records**. This repo edits them via a JSON intermediate, a
browser app, and a Node CLI. A readable Markdown list is the authoring source
for the standard programs.

## Layout (flat, at repo root)

- `sticheditor.js` — core lib + Node CLI. `.dat` ⇄ JSON, validation. Pure ES
  module, no runtime deps. Exports `serializePrograms`, `validateProgram`,
  `createProgram`, `defaultStepInfo`, `importDat`, `exportDat`.
- `index.html` — browser editor (imports `sticheditor.js`; served over HTTP).
- `program.schema.json` — JSON Schema for the program list.
- `programme_300m_ch.json` — the program list (authoritative source).
- `programme_300m_ch.dat` — device file, generated from the JSON.
- `stichliste_300m_ch.md` — human-readable reference of the standard programs.
- `serve.js` — dev server. `manifest.webmanifest` / `sw.js` / `icon.svg` — PWA.
- `build-singlefile.js` — inlines the app into one self-contained `.html`.
- `.github/workflows/deploy.yml` — on release: deploy Pages + attach single file.

## Commands

Node.js (v24); no dependencies (`package.json` has scripts only, `npm install`
does nothing). Node auto-detects ES module syntax — don't add a bundler.

```bash
npm run dev                               # dev server, http://localhost:8000
npm run build                             # → sintro-sticheditor.html (single file)
node sticheditor.js dat-to-json in.dat out.json
node sticheditor.js json-to-dat in.json out.dat   # validates first
```

## Distribution

Two channels, both from the same source (`deploy.yml`, on release):
- **GitHub Pages** — the multi-file PWA (installable, offline via `sw.js`).
- **Single-file** — `build-singlefile.js` inlines `sticheditor.js` and strips
  the PWA markup (between `<!-- PWA:START/END -->` markers) and the Node CLI
  tail, producing a `file://`-openable `.html` attached to the release.
  Keep the app import-inlinable and the PWA markers intact.

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

## Source of truth

`programme_300m_ch.json` is authoritative. Edit it directly or via the web app,
then regenerate the `.dat` with `json-to-dat`. `stichliste_300m_ch.md` is a
human-readable reference of the standard programs (it also documents the
conventions below). All derived fields are already baked into the JSON — the
only rule that stays runtime is `defaultStepInfo`, which fills an empty `info`
at serialize time.

The JSON list is a versioned envelope — `{ "format": "sintro-programs",
"version": 1, "programs": [ … ] }` — shared by the files, the CLI,
sessionStorage, and clipboard copy/paste. `wrapPrograms`/`unwrapPrograms` in
`sticheditor.js` produce/read it. Schema: `program.schema.json`.

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

## Gotchas

- Round-tripping `.dat`→JSON→`.dat` changes only `passeProgress` (spaces vs "")
  — cosmetic, identical bytes on disk.
- Calibration programs (997–998, printFormat `X`) are verbatim device programs;
  the conventions above do NOT apply to them — leave their fields as-is.
- Always validate (`json-to-dat` does) before trusting a `.dat`.

## License

GNU AGPL-3.0.
