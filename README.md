# Sintro Sticheditor

## 🌐 Web App / Application

🇩🇪 **Suchen Sie die App?** [Hier klicken, um den Sintro Sticheditor zu nutzen](https://schiesssport.github.io/sintro-sticheditor/)

🇫🇷 **Vous cherchez l'application ?** [Cliquez ici pour utiliser le Sintro Sticheditor](https://schiesssport.github.io/sintro-sticheditor/)

🇮🇹 **Cerchi l'applicazione?** [Clicca qui per usare il Sintro Sticheditor](https://schiesssport.github.io/sintro-sticheditor/)

🇬🇧 **Looking for the app?** [Click here to use the Sintro Sticheditor](https://schiesssport.github.io/sintro-sticheditor/)

---

## Für Anwender:innen

Der **Sintro Sticheditor** bearbeitet die **Stiche** (Schiessprogramme) der
SINTRO-Trefferanzeige für 300 m. Das Gerät speichert seine Programme in einer
`.dat`-Datei; mit diesem Werkzeug lädst du sie, bearbeitest Programme und Passen
und schreibst die `.dat` wieder zurück — ohne Installation, ohne Konto.

Es gibt zwei Wege, die App zu nutzen:

1. **Online / installierbar (empfohlen):**
   [App öffnen](https://schiesssport.github.io/sintro-sticheditor/). Sie läuft im
   Browser, funktioniert nach dem ersten Laden **offline** und lässt sich auf
   Desktop oder Tablet als Web-App **installieren**. Alle Daten bleiben lokal auf
   deinem Gerät.
2. **Einzeldatei zum Herunterladen:** Unter
   [Releases](https://github.com/Schiesssport/sintro-sticheditor/releases) die
   Datei `sintro-sticheditor.html` herunterladen und per Doppelklick öffnen — eine
   einzige Datei, komplett offline, kein Server nötig.

Diese Software ist kostenlos und Open Source, entwickelt für die Schweizer
Schützenvereine.

---

## Technical overview

> **Coding agents:** read [`AGENTS.md`](AGENTS.md) first — it is the operational
> contract for this repository (architecture, data model, conventions).

A dependency-free, offline-first editor for the shooting programs ("Stiche") of
the SINTRO Trefferanzeige (300 m). The device format is a binary `.dat` of fixed
328-byte records; the app edits a JSON representation and writes the `.dat` back.
`sticheditor.js` is both the browser module and a Node CLI.

### Contents

| File | Purpose |
|------|---------|
| `index.html` | Web app — import `.dat`, edit programs, export `.dat` |
| `sticheditor.js` | Core: `.dat` ⇄ JSON, validation (ES module + Node CLI) |
| `program.schema.json` | JSON Schema of the program list |
| `programme_300m_ch.json` | Program list (JSON) — authoritative source |
| `programme_300m_ch.dat` | Generated device file |
| `stichliste_300m_ch.md` | Human-readable reference of the standard programs |
| `manifest.webmanifest`, `sw.js`, `icon.svg` | PWA shell (installable, offline) |
| `serve.js` | Tiny Node dev server (no dependencies) |
| `build-singlefile.js` | Bundles the app into one self-contained `.html` |
| `.github/workflows/deploy.yml` | On release: deploy Pages + attach single-file asset |

### Run locally

Node.js (v24) — no install step, no dependencies.

```bash
npm run dev     # http://localhost:8000  (service worker network-first)
npm run prod    # same, but SW behaves like a deployed release
```

(`file://` does not work for the multi-file app because of ES modules — use the
dev server, or the single-file build below.)

### Build the single-file editor

```bash
npm run build   # → sintro-sticheditor.html (self-contained, opens from file://)
```

### CLI

```bash
node sticheditor.js dat-to-json in.dat out.json
node sticheditor.js json-to-dat in.json out.dat   # validates first
```

### Editing programs

`programme_300m_ch.json` is authoritative. Edit it directly or via the app, then
regenerate the `.dat` with `json-to-dat`. `stichliste_300m_ch.md` documents the
standard programs and the SINTRO conventions (section *SINTRO-spezifisch*).

Program numbers: `1–99` club-internal, `101–199` regional, `200+` Swiss standard
programs. Data model details: `program.schema.json`.

## License

GNU AGPL-3.0 — see `LICENSE`.
