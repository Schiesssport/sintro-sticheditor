# Stichliste Schweiz – 300m

Maschinenverarbeitbare Stichliste 300m

## Prg-Nummernkreis

- **1–99**: reserviert für vereinsinterne Programme.
- **101–199**: reserviert für regionale Programme.
- **ab 200**: Standardstiche Schweiz (diese Liste, blockweise pro Kategorie).

## Step-Kodierung

Jeder Schritt: `<sil><calc><fireMethod><shotNum>` — z. B. `A5P3` = Scheibe A,
Berechnung 5, Feuerart P, Schusszahl 3.

| Feld | Bedeutung |
|------|-----------|
| `sil` | Scheibe / Silhouette (`A5`, `A10`, `A100`, `B4`, `B10`, `B100`) |
| `fireMethod` | `P` = Probe, `E` = Einzelfeuer (EF), `S` = Serienfeuer (SF) |
| `shotNum` | Schusszahl (max. `99`; `99` = unbegrenzt, z. B. SF0 / PR+) |

- **`P+`-Präfix**: „Probe frei" vor einem aktiven Schritt (unbegrenzte Probe),
  z. B. `P+A10E10`. Kein eigener Step.
- **Schritte**: durch Leerzeichen getrennt.
- **Notizen**: optionale Spalte; mehrere Notizen durch `|` getrennt. Enthält
  u. a. Stellungen (`Alle Schritte stehend`, `Schritte 1-3 liegend`).

---

## A5

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 201 | A5  P+ mit Druck | `A5P99` | | 011 |
| 202 | A5  P+ ohne Druck | `A5P99` | | 085 |
| 203 | A5  P+ E4 | `P+A5E4` | | 019 |
| 204 | A5  P+ E5 | `P+A5E5` | | 012 |
| 205 | A5  P+ E6 | `P+A5E6` | | 013 |
| 206 | A5  P+ E8 | `P+A5E8` | | 020 |
| 207 | A5  P+ E10 | `P+A5E10` | | 015 |
| 208 | A5  P+ S0 | `P+A5S99` | | 010 |
| 209 | A5  P+ S5 | `P+A5S5` | | 023 |
| 210 | A5  P+ S6 | `P+A5S6` | | 024 |
| 211 | A5  P+ S3 S3 | `P+A5S3` `A5S3` | | 025 |
| 212 | A5  P+ S4 S4 | `P+A5S4` `A5S4` | | 026 |
| 213 | A5  P+ S5 S5 | `P+A5S5` `A5S5` | | 016 |
| 214 | A5  P2 S2 S3 S5 | `A5P2` `A5S2` `A5S3` `A5S5` | | 344 |
| 215 | A5  P1 S2 S3 S4 S5 | `A5P1` `A5S2` `A5S3` `A5S4` `A5S5` | | 346 |
| 216 | A5  P2 S2 S2 S3 S3 | `A5P2` `A5S2` `A5S2` `A5S3` `A5S3` | | 348 |
| 217 | A5  P+ E4 S4 | `P+A5E4` `A5S4` | | 006 |
| 218 | A5  P+ E5 S3 | `P+A5E5` `A5S3` | | 021 |
| 219 | A5  P+ E2 S3 S5 | `P+A5E2` `A5S3` `A5S5` | | 009 |
| 220 | A5  P+ E4 S3 S3 | `P+A5E4` `A5S3` `A5S3` | | 022 |
| 221 | A5  P+ E5 S3 S4 | `P+A5E5` `A5S3` `A5S4` | | 007 |
| 222 | A5  P+ E6 S3 S3 | `P+A5E6` `A5S3` `A5S3` | | 676 |
| 223 | A5  P+ E2 S2 S3 S5 | `P+A5E2` `A5S2` `A5S3` `A5S5` | | 008 |
| 224 | A5  P+ E5 S5 S5 | `P+A5E5` `A5S5` `A5S5` | | 014 |
| 225 | A5  E6 S4 | `A5E6` `A5S4` | | 002 |
| 226 | A5  P2 E1 S3 S6 | `A5P2` `A5E1` `A5S3` `A5S6` | | 027 |
| 227 | A5  P2 E2 S3 S3 | `A5P2` `A5E2` `A5S3` `A5S3` | | 668 |
| 228 | A5  P2 E2 S3 S5 | `A5P2` `A5E2` `A5S3` `A5S5` | | 003 |
| 229 | A5  P2 E5 S3 S4 | `A5P2` `A5E5` `A5S3` `A5S4` | | 667 |
| 230 | A5  P3 E6 S3 S3 | `A5P3` `A5E6` `A5S3` `A5S3` | | 001 |
| 231 | A5  P2 S2 S2 S3 S3 | `A5P2` `A5S2` `A5S2` `A5S3` `A5S3` | | 005 |
| 232 | A5  P1 E2 E3 E4 E5 | `A5P1` `A5E2` `A5E3` `A5E4` `A5E5` | | 004 |

## A10

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 301 | A10  P+ mit Druck | `A10P99` | | 031 |
| 302 | A10  P+ ohne Druck | `A10P99` | | 086 |
| 303 | A10  P+ E5 | `P+A10E5` | | 033 |
| 304 | A10  P+ E6 | `P+A10E6` | | 034 |
| 305 | A10  P+ E8 | `P+A10E8` | | 035 |
| 306 | A10  P+ E10 | `P+A10E10` | | 036 |
| 307 | A10  P2 E6 | `A10P2` `A10E6` | | 666 |
| 308 | A10  P2 E10 | `A10P2` `A10E10` | | 029 |
| 309 | A10  P2 E6 E4 | `A10P2` `A10E6` `A10E4` | | 038 |
| 310 | A10  P+ S0 | `P+A10S99` | | 030 |
| 311 | A10  P+ S5 | `P+A10S5` | | 043 |
| 312 | A10  P+ S6 | `P+A10S6` | | 044 |
| 313 | A10  P+ S3 S3 | `P+A10S3` `A10S3` | | 045 |
| 314 | A10  P+ S5 S5 | `P+A10S5` `A10S5` | | 090 |
| 315 | A10  P2 S1 | `A10P2` `A10S1` | | 694 |
| 316 | A10  P2 S2 S3 S5 | `A10P2` `A10S2` `A10S3` `A10S5` | | 040 |
| 317 | A10  P2 4*S5 | `A10P2` `A10S5` `A10S5` `A10S5` `A10S5` | | 028 |
| 318 | A10  P+ E3 S3 | `P+A10E3` `A10S3` | | 041 |
| 319 | A10  P+ E4 S4 | `P+A10E4` `A10S4` | | 042 |
| 320 | A10  P+ E5 S3 | `P+A10E5` `A10S3` | | 046 |
| 321 | A10  P+ E6 S4 | `P+A10E6` `A10S4` | | 032 |
| 322 | A10  P+ E2 S3 S5 | `P+A10E2` `A10S3` `A10S5` | | 039 |
| 323 | A10  P+ E2 S3 S5 | `P+A10E2` `A10S3` `A10S5` | | 357 |
| 324 | A10  P+ E4 S3 S3 | `P+A10E4` `A10S3` `A10S3` | | 210 |
| 325 | A10  P+ E3 E4 S4 S4 | `P+A10E3` `A10E4` `A10S4` `A10S4` | | 677 |
| 326 | A10  E4 S4 | `A10E4` `A10S4` | | 047 |
| 327 | A10  E5 S3 | `A10E5` `A10S3` | | 037 |
| 328 | A10  E6 S6 | `A10E6` `A10S6` | | 048 |
| 329 | A10  P2 E5 S2 S3 | `A10P2` `A10E5` `A10S2` `A10S3` | | 356 |
| 330 | A10  P2 4*S5 | `A10P2` `A10S5` `A10S5` `A10S5` `A10S5` | | 695 |
| 331 | A10  Liegend 4*E10 | `A10E10` `A10E10` `A10E10` `A10E10` | Alle Schritte liegend | 589 |
| 332 | A10  Stehend 4*E10 | `A10E10` `A10E10` `A10E10` `A10E10` | Alle Schritte stehend | 579 |
| 333 | A10  Kniend 4*E10 | `A10E10` `A10E10` `A10E10` `A10E10` | Alle Schritte kniend | 569 |
| 334 | A10  Liegendmatch P+ 6*E10 | `P+A10E10` `A10E10` `A10E10` `A10E10` `A10E10` `A10E10` | | 722 |
| 335 | A10  Match 2 Stellung | `P+A10E10` `A10E10` `A10E10` `A10E10` `A10E10` `A10E10` | Schritte 1-3 liegend \| Schritte 4-6 kniend | 717 |
| 336 | A10  Match 3 Stellung 3x20 | `P+A10E10` `A10E10` `A10E10` `A10E10` `A10E10` `A10E10` | Schritte 1-2 kniend \| Schritte 3-4 liegend \| Schritte 5-6 stehend | 723 |
| 337 | A10  Match 3 Stellung 3x40 | `P+A10E20` `A10E20` `A10E20` `A10E20` `A10E20` `A10E20` | Schritte 1-2 kniend \| Schritte 3-4 liegend \| Schritte 5-6 stehend | 721 |

## A100

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 401 | A100  P+ mit Druck | `A100P99` | | 051 |
| 402 | A100  P+ ohne Druck | `A100P99` | | 087 |
| 403 | A100  P+ E2 (Nachdoppel) | `P+A100E2` | | 052 |
| 404 | A100  P+ E3 | `P+A100E3` | | 053 |
| 405 | A100  P+ E4 | `P+A100E4` | | 054 |
| 406 | A100  P+ E5 | `P+A100E5` | | 055 |
| 407 | A100  P+ E6 | `P+A100E6` | | 056 |
| 408 | A100  P+ E10 | `P+A100E10` | | 057 |
| 409 | A100  P+ E15 | `P+A100E15` | | 088 |
| 410 | A100  P1 E4 | `A100P1` `A100E4` | | 665 |
| 411 | A100  P+ S0 | `P+A100S99` | | 050 |
| 412 | A100  P+ S4 S4 | `P+A100S4` `A100S4` | | 049 |
| 413 | A100  P2 E5 S2 S3 | `A100P2` `A100E5` `A100S2` `A100S3` | | 058 |

## B4

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 501 | B4  P+ mit Druck | `B4P99` | | 061 |
| 502 | B4  P+ ohne Druck | `B4P99` | | 089 |
| 503 | B4  P+ E6 | `P+B4E6` | | 062 |
| 504 | B4  P+ S0 | `P+B4S99` | | 060 |
| 505 | B4  P+ S5 | `P+B4S5` | | 064 |
| 506 | B4  P+ S6 | `P+B4S6` | | 063 |
| 507 | B4  P+ S3 S3 | `P+B4S3` `B4S3` | | 065 |
| 508 | B4  P+ S4 S4 | `P+B4S4` `B4S4` | | 066 |
| 509 | B4  P2 S4 S6 | `B4P2` `B4S4` `B4S6` | | 349 |
| 510 | B4  P+ E3 S3 S3 | `P+B4E3` `B4S3` `B4S3` | | 067 |
| 511 | B4  P+ E3 S3 S6 | `P+B4E3` `B4S3` `B4S6` | | 379 |
| 512 | B4  P+ E3 S3 S3 S3 | `P+B4E3` `B4S3` `B4S3` `B4S3` | | 069 |
| 513 | B4  P+ E4 S4 | `P+B4E4` `B4S4` | | 345 |
| 514 | B4  Feldschiessen P+ | `P+B4E6` `B4S3` `B4S3` `B4S6` | Druckformat: r | 059 |
| 515 | B4  Feldstich P+ E6 S3 S3 S6 | `P+B4E6` `B4S3` `B4S3` `B4S6` | | 091 |
| 516 | B4  P2 E1 E3 E6 | `B4P2` `B4E1` `B4E3` `B4E6` | | 068 |
| 517 | B4  P2 E2 S3 S5 | `B4P2` `B4E2` `B4S3` `B4S5` | | 669 |
| 518 | B4  E4 S4 | `B4E4` `B4S4` | | 070 |
| 519 | B4  P2 E6 S6 S6 | `B4P2` `B4E6` `B4S6` `B4S6` | | 075 |

## B10

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 571 | B10  P+ | `B10P99` | | 968 |
| 572 | B10  P+ E0 | `P+B10E99` | | 076 |
| 573 | B10  P+ S0 | `P+B10S99` | | 077 |
| 574 | B10  P+ E2 S3 S5 | `P+B10E2` `B10S3` `B10S5` | | 376 |
| 575 | B10  P+ E2 S2 | `P+B10E2` `B10S2` | | 078 |
| 576 | B10  P+ S3 S5 | `P+B10S3` `B10S5` | | 079 |

## B100

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 591 | B100  P+ | `B100P99` | | 967 |
| 592 | B100  P+ E0 | `P+B100E99` | | 081 |
| 593 | B100  P+ S0 | `P+B100S99` | | 080 |
| 594 | B100  P+ E10 | `P+B100E10` | | 082 |

## OP

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 801 | OP Komplett | `P+A5E5` `P+B4E5` `B4S2` `B4S3` `B4S5` | Druckformat: l | 840 |
| 802 | OP A5 Probe | `A5P99` | Druckformat: l | 839 |
| 803 | OP A5 Programm | `P+A5E5` | Druckformat: l | 838 |
| 804 | OP B4 Probe | `B4P99` | Druckformat: l | 836 |
| 805 | OP B4 Programm | `P+B4E5` `B4S2` `B4S3` `B4S5` | Druckformat: l | 837 |

## Gruppenmeisterschaft

A5P / A10P → P99.

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
| 851 | Gruppenmeisterschaft A5 P+ | `A5P99` | | 398 |
| 852 | Gruppenmeisterschaft A10 P+ | `A10P99` | | 397 |
| 853 | Gruppenmeisterschaft Feld A | `P+A10E10` `A10E10` | | 084 |
| 854 | Gruppenmeisterschaft Feld D | `P+A10E10` `A10S5` | | 083 |
| 855 | Gruppenmeisterschaft Feld E | `P+A10E10` `A10S5` | | 074 |


## Andere

Platzhalter (`A5P1`) für in SIUS existierende Spezialprogramme.

| Prg | Titel | Schritte | Notizen | SiusPrg |
|-----|-------|--------|---------|---------|
|  | Andere Knabenschiessen | `A5P1` | | 399 |
|  | Andere Morgarten | `A5P1` | | 362 |
|  | Andere Pfäffiker Winterstich | `A5P1` | | 377 |
|  | Andere Ustertag-Scheibe | `A5P1` | | 738 |
|  | Andere Vögelinsegg | `A5P1` | | 363 |
|  | Andere Hans Waldmann Schiessen | `A5P1` | | 776 |
|  | Andere Endschiessen | `A5P1` | | 170 |

---

## SINTRO-spezifisch

Diese Regeln betreffen Einstellungen spezifisch im SINTRO-Format (`.dat`). 
Für die Stichliste selbst sind sie nicht relevant.

- **„ohne Druck"**: Programme mit `ohne Druck` im Titel bekommen
  `breakNotAllowed=0` auf den aktiven Schritten — ein Break ist in SINTRO eine
  Probe ohne Ausdruck (gleiche Schritte wie „mit Druck", nur der Break
  unterscheidet sie).
- **Ausdruck** (printMode): Probe-Schritte (Feuerart `P`) → `N`;
  Nicht-Probe-Schritte → `P`, ausser wenn es genau **einen** aktiven
  Nicht-Probe-Schritt gibt → dann `G`.
- **Tiefschuss** (calcHighscore): auf jedem aktiven Serie-Schritt (Feuerart `S`)
  gesetzt — ausser bei den Bundesprogrammen Feldschiessen/Feldstich und OP.
- **Druckformat**: abweichend vom Standard `Z` per Notiz-Tag
  `Druckformat: <Buchstabe>` (z. B. `r` = Rechts, `l` = Links).
- **Info** (Anzeige am Stand): bleibt leer und wird beim Export automatisch aus
  dem Schritt abgeleitet (`A5-P99`, `A5-S5`; kompakt ohne Bindestrich, falls
  länger als 8 Zeichen).
- **internalId**: ungenutzt/nicht angezeigt — enthält die SIUS-Referenz
  `SIUS<###>` (SiusPrg, 3-stellig mit Null aufgefüllt), z. B. `SIUS011`.
- **Kalibrierprogramme** (Prg 997–998, Druckformat `X`): wörtliche
  Geräteprogramme, die sich nicht über die Schritte-Kurzform abbilden lassen;
  in der JSON unverändert enthalten (die obigen Regeln gelten für sie nicht).
