// ---------------------------------------------------------------------------
// ProgramValidator — validates a program object against the original VBA rules
//
// Validation rules match the original VBA exactly:
//   - Calc:        Value <> 0 And IsNumeric  (not strictly > 0)
//   - FireMethod:  IsCapitalLetter — A–Z only
//   - Sil:         IsLetter — A–Z or a–z (VBA checks ASCII 65–90 and 97–122)
//   - PrintMode:   IsLetter — A–Z or a–z
//   - printOffset: no explicit range in VBA; constrained by Integer type (−32768–32767)
//   - All 8 steps are validated with the same rules regardless of shotNum —
//     inactive steps still carry data in the binary and must be valid.
// ---------------------------------------------------------------------------
class ProgramValidator {
  // Returns an array of error strings. Empty array = valid.
  static validate(prog) {
    const errors = [];
    const err = (msg) => errors.push(msg);

    if (!Number.isInteger(prog.prgNum) || prog.prgNum < 1 || prog.prgNum > 999) {
      err(`Stichnummer muss eine ganze Zahl zwischen 1 und 999 sein (ist: ${prog.prgNum})`);
    }

    if (typeof prog.title !== 'string') {
      err('Titel muss ein Text sein');
    } else if (prog.title.length > 28) {
      // On-disk field is 32 chars but 4 are reserved for the "NNN " prgNum prefix
      err(`Titel zu lang: ${prog.title.length} Zeichen (max. 28)`);
    } else {
      const bad = ProgramValidator.#firstNonLatin1(prog.title);
      if (bad) err(`Titel enthält ungültiges Zeichen "${bad}" — nur ASCII/Latin-1 erlaubt`);
    }

    if (typeof prog.internalId !== 'string') {
      err('Interne Bezeichnung muss ein Text sein');
    } else if (prog.internalId.length > 8) {
      err(`Interne Bezeichnung zu lang: ${prog.internalId.length} Zeichen (max. 8)`);
    } else {
      const bad = ProgramValidator.#firstNonLatin1(prog.internalId);
      if (bad) err(`Interne Bezeichnung enthält ungültiges Zeichen "${bad}" — nur ASCII/Latin-1 erlaubt`);
    }

    // VBA Integer range — no tighter constraint visible in source
    if (!ProgramValidator.#isVbaInteger(prog.printOffset)) {
      err(`Printoffset muss eine ganze Zahl zwischen −32768 und 32767 sein (ist: ${prog.printOffset})`);
    }

    // Single letter, any case (no explicit case constraint seen for printFormat)
    if (!ProgramValidator.#isLetter(prog.printFormat)) {
      err(`Druckformat muss ein einzelner Buchstabe sein (ist: "${prog.printFormat}")`);
    }

    if (!ProgramValidator.#isByte(prog.weapon)) {
      err(`Waffe muss eine ganze Zahl zwischen 0 und 255 sein (ist: ${prog.weapon})`);
    }

    if (!ProgramValidator.#isByte(prog.spare2)) {
      err(`Spare2 muss eine ganze Zahl zwischen 0 und 255 sein (ist: ${prog.spare2})`);
    }

    if (!ProgramValidator.#isByte(prog.spareByte)) {
      err(`SpareByte muss eine ganze Zahl zwischen 0 und 255 sein (ist: ${prog.spareByte})`);
    }

    if (!Array.isArray(prog.steps) || prog.steps.length !== 8) {
      err('Programm muss genau 8 Passen enthalten');
      return errors;
    }

    // Once a step has shotNum=0, all following steps must also be 0 (no gaps)
    const firstZeroStep = prog.steps.findIndex(s => s.shotNum === 0);
    if (firstZeroStep !== -1) {
      for (let i = firstZeroStep + 1; i < 8; i++) {
        if (prog.steps[i].shotNum > 0) {
          err(`Passe ${i + 1} hat Schüsse, obwohl Passe ${firstZeroStep + 1} bereits 0 Schüsse hat — keine Lücken erlaubt`);
          break;
        }
      }
    }

    for (let i = 0; i < 8; i++) {
      const step = prog.steps[i];
      const label = `Passe ${i + 1}`;

      // VBA stores as Integer — must fit, shots can't be negative
      if (!Number.isInteger(step.shotNum) || step.shotNum < 0 || step.shotNum > 32767) {
        err(`${label}: Anzahl Schüsse muss eine ganze Zahl zwischen 0 und 32767 sein (ist: ${step.shotNum})`);
      }

      if (typeof step.info !== 'string') {
        err(`${label}: Info muss ein Text sein`);
      } else if (step.info.length > 8) {
        err(`${label}: Info zu lang: ${step.info.length} Zeichen (max. 8)`);
      } else {
        const bad = ProgramValidator.#firstNonLatin1(step.info);
        if (bad) err(`${label}: Info enthält ungültiges Zeichen "${bad}" — nur ASCII/Latin-1 erlaubt`);
      }

      // IsLetter: ASCII 65–90 (A–Z) or 97–122 (a–z)
      if (!ProgramValidator.#isLetter(step.sil)) {
        err(`${label}: Silhouette muss ein Buchstabe (A–Z) sein (ist: "${step.sil}")`);
      }

      // VBA: Calc Value <> 0 And IsNumeric
      if (!Number.isInteger(step.calc) || step.calc === 0) {
        err(`${label}: Wertung muss eine ganze Zahl ungleich 0 sein (ist: ${step.calc})`);
      }

      // IsCapitalLetter: ASCII 65–90 (A–Z) only
      if (!ProgramValidator.#isCapitalLetter(step.fireMethod)) {
        err(`${label}: Feuerart muss ein Grossbuchstabe (A–Z) sein (ist: "${step.fireMethod}")`);
      }

      // IsLetter: ASCII 65–90 (A–Z) or 97–122 (a–z)
      if (!ProgramValidator.#isLetter(step.printMode)) {
        err(`${label}: Ausdruck muss ein Buchstabe (A–Z) sein (ist: "${step.printMode}")`);
      }

      if (!Number.isInteger(step.stepTime1) || step.stepTime1 < 0 || step.stepTime1 > 32767) {
        err(`${label}: Zeit für Seriefeuer muss eine ganze Zahl zwischen 0 und 32767 sein (ist: ${step.stepTime1})`);
      }

      if (step.calcHighscore !== 0 && step.calcHighscore !== 1) {
        err(`${label}: Tiefschuss muss 0 oder 1 sein (ist: ${step.calcHighscore})`);
      }

      if (step.position !== 0 && step.position !== 1 && step.position !== 2) {
        err(`${label}: Stellung muss 0 (liegend), 1 (kniend) oder 2 (stehend) sein (ist: ${step.position})`);
      }

      if (step.breakNotAllowed !== 0 && step.breakNotAllowed !== 1) {
        err(`${label}: Break nicht erlaubt muss 0 oder 1 sein (ist: ${step.breakNotAllowed})`);
      }
    }

    return errors;
  }

  // VBA IsCapitalLetter: ASCII 65–90
  static #isCapitalLetter(val) {
    return typeof val === 'string' && val.length === 1 &&
      val.charCodeAt(0) >= 65 && val.charCodeAt(0) <= 90;
  }

  // VBA IsLetter: ASCII 65–90 (A–Z) or 97–122 (a–z)
  static #isLetter(val) {
    return typeof val === 'string' && val.length === 1 &&
      ((val.charCodeAt(0) >= 65 && val.charCodeAt(0) <= 90) ||
       (val.charCodeAt(0) >= 97 && val.charCodeAt(0) <= 122));
  }

  // VBA Integer: signed 16-bit
  static #isVbaInteger(val) {
    return Number.isInteger(val) && val >= -32768 && val <= 32767;
  }

  static #isByte(val) {
    return Number.isInteger(val) && val >= 0 && val <= 255;
  }

  // Strings are stored byte-by-byte (Latin-1 / Windows-1252). Anything beyond
  // codepoint 255 cannot survive serialization; the writer sanitizes it but
  // we surface it as a validation error so the user notices.
  static #firstNonLatin1(str) {
    for (const c of str) if (c.charCodeAt(0) > 255) return c;
    return null;
  }
}

// ---------------------------------------------------------------------------
// DatParser — binary ↔ program-object conversion
//
// Binary layout (VBA Type ProgramDat, 328 bytes per record, little-endian):
//   Offset  Size  Field
//        0     2  PrgNum          (Integer)
//        2    16  ShotNum[8]      (Integer×8)
//       18    16  StepTime1[8]    (Integer×8)
//       34    16  StepTime2[8]    (Integer×8, always 0)
//       50    16  StepTime3[8]    (Integer×8, always 0)
//       66     8  Sil[8]          (Byte×8, ASCII char code)
//       74    16  Calc[8]         (Integer×8)
//       90     8  FireMethod[8]   (Byte×8, ASCII char code)
//       98     8  PrintMode[8]    (Byte×8, ASCII char code)
//      106    64  Info[8]         (String*8 × 8, space-padded)
//      170    16  NextStep[8]     (Integer×8, derived — not stored in JSON)
//      186    16  CalcHighscore[8](Integer×8)
//      202    16  FireMode[8]     (Integer×8; binary: 1=liegend,3=kniend,4=stehend;
//                    exposed in JSON as `position` — VBA's `FireMode` is a misnomer for "Stellung")
//      218     8  BreakNotAllowed[8] (Byte×8)
//      226    56  passeProgress[8][7] (String*1 × 56, row-major by step;
//                    originally named Spare1 in VBA; contains device-written session
//                    data and sequence markers — preserve as-is, do not regenerate)
//      282     2  PrintOffset     (Integer)
//      284     1  PrintFormat     (Byte, ASCII char code)
//      285     1  Weapon          (Byte)
//      286     1  Spare2          (Byte)
//      287     1  spareByte       (Byte, stored as Asc() — observed values: 48='0', 49='1';
//                    meaning unknown, default 49 for new programs, not shown in UI)
//      288     8  Spare3/InternalId (Byte×8, used as 8-char ANSI string)
//      296    32  Title           (String*32, space-padded)
// ---------------------------------------------------------------------------
class DatParser {
  static RECORD_SIZE = 328;

  // ArrayBuffer → array of program objects
  static parse(arrayBuffer) {
    if (arrayBuffer.byteLength % DatParser.RECORD_SIZE !== 0) {
      throw new Error(
        `File size ${arrayBuffer.byteLength} is not a multiple of ${DatParser.RECORD_SIZE} bytes`
      );
    }

    const view = new DataView(arrayBuffer);
    const count = arrayBuffer.byteLength / DatParser.RECORD_SIZE;
    const programs = [];

    for (let i = 0; i < count; i++) {
      const off = i * DatParser.RECORD_SIZE;
      const prog = DatParser.#readRecord(view, off);

      // Skip empty records: NextStep[0]=0 AND ShotNum[0]=0 (original VBA skip condition)
      if (prog._nextStep[0] === 0 && prog.steps[0].shotNum === 0) continue;
      delete prog._nextStep;

      programs.push(prog);
    }

    return programs;
  }

  // Array of program objects → ArrayBuffer
  static serialize(programs) {
    const buffer = new ArrayBuffer(programs.length * DatParser.RECORD_SIZE);
    const view = new DataView(buffer);
    for (let i = 0; i < programs.length; i++) {
      DatParser.#writeRecord(view, i * DatParser.RECORD_SIZE, programs[i]);
    }
    return buffer;
  }

  static #readRecord(view, off) {
    const ri = (o) => view.getInt16(off + o, true);
    const rb = (o) => view.getUint8(off + o);
    const rs = (o, n) => {
      let s = '';
      for (let k = 0; k < n; k++) s += String.fromCharCode(view.getUint8(off + o + k));
      return s.trimEnd();
    };

    const prgNum = ri(0);
    return {
      prgNum,
      title:       DatParser.#stripPrgNumPrefix(rs(296, 32), prgNum),
      internalId:  rs(288, 8),   // Spare3, used as internal identifier
      printOffset: ri(282),
      printFormat: DatParser.#byteToChar(rb(284)),
      weapon:      rb(285),
      spare2:      rb(286),
      spareByte:   rb(287),
      // passeProgress[step][col] — 8 steps × 7 chars, stored as strings per step
      passeProgress: Array.from({ length: 8 }, (_, s) =>
        rs(226 + s * 7, 7)
      ),
      steps: Array.from({ length: 8 }, (_, i) => ({
        shotNum:         ri(2   + i * 2),
        info:            rs(106 + i * 8, 8),
        sil:             DatParser.#byteToChar(rb(66  + i)),
        calc:            ri(74  + i * 2),
        fireMethod:      DatParser.#byteToChar(rb(90  + i)),
        printMode:       DatParser.#byteToChar(rb(98  + i)),
        stepTime1:       ri(18  + i * 2),
        calcHighscore:   ri(186 + i * 2),
        position:        DatParser.#binaryPositionToUi(ri(202 + i * 2)),
        breakNotAllowed: rb(218 + i),
      })),
      // kept temporarily to detect empty records; deleted before returning from parse()
      _nextStep: Array.from({ length: 8 }, (_, i) => ri(170 + i * 2)),
    };
  }

  static #writeRecord(view, off, prog) {
    const wi = (o, v) => view.setInt16(off + o, v, true);
    const wb = (o, v) => view.setUint8(off + o, v);
    const ws = (o, n, s) => {
      const padded = String(s ?? '').padEnd(n, ' ').slice(0, n);
      // Sanitize codepoints > 255 to '?' (matches VBA's StrConv ANSI fallback).
      // The validator rejects these earlier, but if one slips through (direct
      // serialize call without validation), we don't want a silent low-byte truncation.
      for (let k = 0; k < n; k++) {
        const cc = padded.charCodeAt(k);
        view.setUint8(off + o + k, cc > 255 ? 0x3F : cc);
      }
    };

    wi(0, prog.prgNum);

    // Derive NextStep from ShotNum (VBA logic: 1 if next step has shots, else 0; last always 0)
    for (let i = 0; i < 8; i++) {
      const s = prog.steps[i];
      wi(2   + i * 2, s.shotNum);
      wi(18  + i * 2, s.stepTime1);
      wi(34  + i * 2, 0);   // StepTime2 unused
      wi(50  + i * 2, 0);   // StepTime3 unused
      wb(66  + i,     DatParser.#charToByte(s.sil));
      wi(74  + i * 2, s.calc);
      wb(90  + i,     DatParser.#charToByte(s.fireMethod));
      wb(98  + i,     DatParser.#charToByte(s.printMode));
      ws(106 + i * 8, 8, s.info || defaultStepInfo(s));
      wi(170 + i * 2, i < 7 && prog.steps[i + 1].shotNum > 0 ? 1 : 0);
      wi(186 + i * 2, s.calcHighscore);
      wi(202 + i * 2, DatParser.#uiPositionToBinary(s.position));
      wb(218 + i,     s.breakNotAllowed);
    }

    // passeProgress: 8 steps × 7 chars
    for (let s = 0; s < 8; s++) {
      const row = String(prog.passeProgress?.[s] ?? '').padEnd(7, ' ').slice(0, 7);
      for (let j = 0; j < 7; j++) view.setUint8(off + 226 + s * 7 + j, row.charCodeAt(j));
    }

    wi(282, prog.printOffset);
    wb(284, DatParser.#charToByte(prog.printFormat));
    wb(285, prog.weapon);
    wb(286, prog.spare2);
    wb(287, prog.spareByte);
    ws(288, 8, prog.internalId);   // Spare3
    ws(296, 32, DatParser.#addPrgNumPrefix(prog.title, prog.prgNum));
  }

  // Binary position: 1=liegend, 3=kniend, 4=stehend → UI values: 0, 1, 2
  static #binaryPositionToUi(v) {
    if (v === 3) return 1;
    if (v === 4) return 2;
    return 0;  // 1 or any unexpected value → liegend
  }

  // UI values: 0=liegend, 1=kniend, 2=stehend → binary: 1, 3, 4
  static #uiPositionToBinary(v) {
    if (v === 1) return 3;
    if (v === 2) return 4;
    return 1;  // 0 or any unexpected value → liegend
  }

  // Titles in the .dat are stored prefixed with the zero-padded prgNum
  // (e.g. "001 A5-PR3-EF6"). Strip on read, re-add on write so the JSON
  // representation carries only the human-meaningful title.
  static #prgNumPrefix(prgNum) {
    return String(prgNum).padStart(3, '0') + ' ';
  }

  static #stripPrgNumPrefix(title, prgNum) {
    const prefix = DatParser.#prgNumPrefix(prgNum);
    return title.startsWith(prefix) ? title.slice(prefix.length) : title;
  }

  static #addPrgNumPrefix(title, prgNum) {
    const prefix = DatParser.#prgNumPrefix(prgNum);
    const clean = String(title ?? '').startsWith(prefix)
      ? String(title).slice(prefix.length)
      : String(title ?? '');
    return prefix + clean;
  }

  // Byte → single char; 0 or control chars → empty string
  static #byteToChar(b) {
    return b >= 32 ? String.fromCharCode(b) : '';
  }

  // Single char → byte; empty/undefined → 0
  static #charToByte(c) {
    return typeof c === 'string' && c.length > 0 ? c.charCodeAt(0) : 0;
  }
}

// ---------------------------------------------------------------------------
// Program-list JSON format — a self-identifying, versioned envelope shared by
// the JSON files (programme_300m_ch.json, CLI output), the app's sessionStorage,
// and the clipboard copy/paste. `wrapPrograms` produces it, `unwrapPrograms`
// reads it.
// ---------------------------------------------------------------------------
export const STICHE_FORMAT = 'sintro-programs';
export const STICHE_VERSION = 1;

export function wrapPrograms(programs) {
  return { format: STICHE_FORMAT, version: STICHE_VERSION, programs };
}

// Returns the programs array from an envelope, or null if the value isn't a
// recognizable program list.
export function unwrapPrograms(data) {
  if (data && typeof data === 'object' && Array.isArray(data.programs)) return data.programs;
  return null;
}

// ---------------------------------------------------------------------------
// ProgramStore — persistence (browser: sessionStorage, Node: JSON file)
// ---------------------------------------------------------------------------
class ProgramStore {
  static STORAGE_KEY = 'sintro_programs';

  static async save(programs, filePath = 'programs.json') {
    const json = JSON.stringify(wrapPrograms(programs), null, 2);
    if (ProgramStore.#isNode()) {
      const { writeFileSync } = await import('fs');
      writeFileSync(filePath, json, 'utf8');
      console.log(`Saved ${programs.length} programs to ${filePath}`);
    } else {
      sessionStorage.setItem(ProgramStore.STORAGE_KEY, json);
    }
  }

  static async load(filePath = 'programs.json') {
    if (ProgramStore.#isNode()) {
      const { readFileSync } = await import('fs');
      const programs = unwrapPrograms(JSON.parse(readFileSync(filePath, 'utf8')));
      if (programs == null) {
        throw new Error(`Unrecognized JSON in ${filePath}: expected ` +
          `{ format: "${STICHE_FORMAT}", version: ${STICHE_VERSION}, programs: [...] }.`);
      }
      return programs;
    } else {
      const json = sessionStorage.getItem(ProgramStore.STORAGE_KEY);
      return json ? (unwrapPrograms(JSON.parse(json)) ?? []) : [];
    }
  }

  static #isNode() {
    return typeof process !== 'undefined' && process.versions?.node != null;
  }
}

export function serializePrograms(programs) {
  return DatParser.serialize(programs);
}

// Thin export so the browser UI can validate without importing the class directly
export function validateProgram(prog) {
  return ProgramValidator.validate(prog);
}

// ---------------------------------------------------------------------------
// defaultStepInfo — readable per-step label shown to the shooter, derived from
// the step's own fields (e.g. "A5-P100", "A5-S5"). Used as the fallback when
// `info` is left empty (filled in at serialization time) and as the suggested
// placeholder in the editor UI. Empty for inactive steps (shotNum 0).
// Falls back to a compact, dash-less form when the dashed form would exceed
// the 8-char field (e.g. "A100-P100" → "A100P100").
// ---------------------------------------------------------------------------
export function defaultStepInfo(step) {
  if (!step || !(step.shotNum > 0)) return '';
  const dashed = `${step.sil}${step.calc}-${step.fireMethod}${step.shotNum}`;
  return dashed.length <= 8 ? dashed : dashed.replace('-', '').slice(0, 8);
}

// ---------------------------------------------------------------------------
// createProgram — factory for new programs with safe defaults
//
// spareByte defaults to 49 (ASCII '1') — the majority value across real data;
//   meaning is unknown but the device expects it set. Not shown in the UI.
// spare2 is always 0 in all observed records and is not shown in the UI.
// passeProgress is zeroed out — the Trefferanzeige device will populate it
//   after first use.
// ---------------------------------------------------------------------------
export function createProgram(prgNum) {
  const defaultStep = {
    shotNum:         0,
    info:            '',
    sil:             'A',
    calc:            5,
    fireMethod:      'E',
    printMode:       'N',
    stepTime1:       0,
    calcHighscore:   0,
    position:        0,
    breakNotAllowed: 1,
  };

  return {
    prgNum,
    title:         '',
    internalId:    '',
    printOffset:   0,
    printFormat:   'Z',
    weapon:        0,
    spare2:        0,
    spareByte:     49,   // ASCII '1' — do not expose in UI
    passeProgress: Array.from({ length: 8 }, () => '       '),
    steps:         Array.from({ length: 8 }, () => ({ ...defaultStep })),
  };
}

// ---------------------------------------------------------------------------
// importDat — parse a .dat binary, validate every program, store as JSON
// Returns { programs, errors } where errors is a map of prgNum → error list
// ---------------------------------------------------------------------------
export async function importDat(arrayBuffer, jsonFilePath = 'programs.json') {
  const programs = DatParser.parse(arrayBuffer);

  const validationErrors = {};
  for (const prog of programs) {
    const errs = ProgramValidator.validate(prog);
    if (errs.length > 0) validationErrors[prog.prgNum] = errs;
  }

  await ProgramStore.save(programs, jsonFilePath);
  return { programs, validationErrors };
}

// ---------------------------------------------------------------------------
// exportDat — load programs from JSON/localStorage, validate, write .dat
// Returns ArrayBuffer ready for download/write
// ---------------------------------------------------------------------------
export async function exportDat(jsonFilePath = 'programs.json') {
  const programs = await ProgramStore.load(jsonFilePath);

  const validationErrors = {};
  for (const prog of programs) {
    const errs = ProgramValidator.validate(prog);
    if (errs.length > 0) validationErrors[prog.prgNum] = errs;
  }

  if (Object.keys(validationErrors).length > 0) {
    throw Object.assign(
      new Error('Validation failed — fix errors before exporting'),
      { validationErrors }
    );
  }

  return DatParser.serialize(programs);
}

// ---------------------------------------------------------------------------
// Node.js CLI — only runs when executed directly, not when imported as module
//
// Usage:
//   node sticheditor.js dat-to-json <input.dat>  <output.json>
//   node sticheditor.js json-to-dat <input.json> <output.dat>
// ---------------------------------------------------------------------------
if (typeof process !== 'undefined' && process.versions?.node != null) {
  const { fileURLToPath } = await import('url');

  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { readFileSync, writeFileSync } = await import('fs');

    const [, , command, inFile, outFile] = process.argv;
    const assertExt = (file, ext, role) => {
      if (!file.toLowerCase().endsWith(ext)) {
        console.error(`Error: expected ${role} file with extension ${ext}, got: ${file}`);
        process.exit(1);
      }
    };
    const USAGE = [
      'Usage:',
      '  node sticheditor.js dat-to-json <input.dat>  <output.json>',
      '  node sticheditor.js json-to-dat <input.json> <output.dat>',
    ].join('\n');

    if (command === 'dat-to-json') {
      if (!inFile || !outFile) { console.error(USAGE); process.exit(1); }
      assertExt(inFile,  '.dat', 'input');
      assertExt(outFile, '.json', 'output');

      const buf = readFileSync(inFile);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const { programs, validationErrors } = await importDat(ab, outFile);

      console.log(`Parsed ${programs.length} programs from ${inFile} → ${outFile}`);
      const errEntries = Object.entries(validationErrors);
      if (errEntries.length > 0) {
        console.warn(`Validation warnings in ${errEntries.length} program(s):`);
        for (const [num, errs] of errEntries) {
          console.warn(`  Stich ${num}:\n    ${errs.join('\n    ')}`);
        }
      } else {
        console.log('All programs valid.');
      }

    } else if (command === 'json-to-dat') {
      if (!inFile || !outFile) { console.error(USAGE); process.exit(1); }
      assertExt(inFile,  '.json', 'input');
      assertExt(outFile, '.dat',  'output');

      try {
        const buffer = await exportDat(inFile);
        writeFileSync(outFile, Buffer.from(buffer));
        console.log(`Wrote ${outFile}`);
      } catch (e) {
        console.error(`Error: ${e.message}`);
        if (e.validationErrors) {
          for (const [num, errs] of Object.entries(e.validationErrors)) {
            console.error(`  Stich ${num}:\n    ${errs.join('\n    ')}`);
          }
        }
        process.exit(1);
      }

    } else {
      console.error(USAGE);
      process.exit(1);
    }
  }
}
