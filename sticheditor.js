// Core library + Node CLI for the Sintro Sticheditor: .dat <-> JSON conversion,
// validation, and the versioned JSON envelope. Pure ES module, no dependencies.

// ── Validation ──────────────────────────────────────────────────────────────
// Rules mirror the original VBA exactly:
//   calc <> 0 (IsNumeric); fireMethod A–Z (IsCapitalLetter); sil/printMode A–Z
//   or a–z (IsLetter); integers bounded by their VBA type. All 8 steps are
//   validated regardless of shotNum — inactive steps still carry binary data.
// validate() returns [{ code, params }]; use formatValidationError() to render.
class ProgramValidator {
  static validate(prog) {
    const errors = [];
    const err = (code, params) => errors.push({ code, params });

    if (!Number.isInteger(prog.prgNum) || prog.prgNum < 1 || prog.prgNum > 999) {
      err('prgNumRange', { value: prog.prgNum });
    }

    validateLatin1Field(prog.title, 28, 'title', err);
    validateLatin1Field(prog.internalId, 8, 'internalId', err);

    if (!isVbaInteger(prog.printOffset)) err('printOffsetRange', { value: prog.printOffset });
    if (!isLetter(prog.printFormat))     err('printFormatLetter', { value: prog.printFormat });
    if (!isByte(prog.weapon))            err('weaponByte', { value: prog.weapon });
    if (!isByte(prog.spare2))            err('spare2Byte', { value: prog.spare2 });
    if (!isByte(prog.spareByte))         err('spareByteByte', { value: prog.spareByte });

    if (!Array.isArray(prog.steps) || prog.steps.length !== 8) {
      err('stepCountEight');
      return errors;
    }

    const firstZero = prog.steps.findIndex(s => s.shotNum === 0);
    if (firstZero !== -1) {
      for (let i = firstZero + 1; i < 8; i++) {
        if (prog.steps[i].shotNum > 0) {
          err('stepGap', { step: i + 1, firstZero: firstZero + 1 });
          break;
        }
      }
    }

    prog.steps.forEach((step, i) => validateStep(step, i + 1, err));
    return errors;
  }
}

function validateStep(step, step1, err) {
  const p = (params) => ({ step: step1, ...params });

  if (!Number.isInteger(step.shotNum) || step.shotNum < 0 || step.shotNum > 99) {
    err('stepShotNum', p({ value: step.shotNum }));
  }
  validateLatin1Field(step.info, 8, 'stepInfo', err, step1);
  if (!isLetter(step.sil))              err('stepSil', p({ value: step.sil }));
  if (!Number.isInteger(step.calc) || step.calc === 0) err('stepCalc', p({ value: step.calc }));
  if (!isCapitalLetter(step.fireMethod)) err('stepFireMethod', p({ value: step.fireMethod }));
  if (!isLetter(step.printMode))        err('stepPrintMode', p({ value: step.printMode }));
  if (!Number.isInteger(step.stepTime1) || step.stepTime1 < 0 || step.stepTime1 > 32767) {
    err('stepTime1', p({ value: step.stepTime1 }));
  }
  if (step.calcHighscore !== 0 && step.calcHighscore !== 1) err('stepCalcHighscore', p({ value: step.calcHighscore }));
  if (step.position !== 0 && step.position !== 1 && step.position !== 2) err('stepPosition', p({ value: step.position }));
  if (step.breakNotAllowed !== 0 && step.breakNotAllowed !== 1) err('stepBreakNotAllowed', p({ value: step.breakNotAllowed }));
}

// Validates a string field for type, length and Latin-1 range. `prefix` selects
// the message family (title / internalId / stepInfo); step-scoped families carry
// the step number so the rendered message can name the stage.
function validateLatin1Field(value, maxLen, prefix, err, step) {
  const code = (suffix) => prefix + suffix;
  const params = step ? { step } : {};
  if (typeof value !== 'string') {
    err(code('Type'), params);
  } else if (value.length > maxLen) {
    err(code('TooLong'), { ...params, len: value.length });
  } else {
    const bad = firstNonLatin1(value);
    if (bad) err(code('BadChar'), { ...params, char: bad });
  }
}

const isCapitalLetter = (v) => typeof v === 'string' && v.length === 1 && v.charCodeAt(0) >= 65 && v.charCodeAt(0) <= 90;
const isLetter = (v) => typeof v === 'string' && v.length === 1 &&
  ((v.charCodeAt(0) >= 65 && v.charCodeAt(0) <= 90) || (v.charCodeAt(0) >= 97 && v.charCodeAt(0) <= 122));
const isVbaInteger = (v) => Number.isInteger(v) && v >= -32768 && v <= 32767;
const isByte = (v) => Number.isInteger(v) && v >= 0 && v <= 255;

// Strings are stored byte-by-byte (Latin-1); codepoints > 255 cannot survive.
function firstNonLatin1(str) {
  for (const c of str) if (c.charCodeAt(0) > 255) return c;
  return null;
}

// ── Validation message catalogue (en/de/fr) ─────────────────────────────────
// Templates interpolate {name} placeholders from a validation error's params.
// The CLI renders English; the browser renders the active UI language.
export const VALIDATION_MESSAGES = {
  en: {
    prgNumRange: 'Program number must be an integer between 1 and 999 (is: {value})',
    titleType: 'Title must be text',
    titleTooLong: 'Title too long: {len} characters (max. 28)',
    titleBadChar: 'Title contains an invalid character "{char}" — only ASCII/Latin-1 allowed',
    internalIdType: 'Internal ID must be text',
    internalIdTooLong: 'Internal ID too long: {len} characters (max. 8)',
    internalIdBadChar: 'Internal ID contains an invalid character "{char}" — only ASCII/Latin-1 allowed',
    printOffsetRange: 'Paper feed must be an integer between −32768 and 32767 (is: {value})',
    printFormatLetter: 'Print format must be a single letter (is: "{value}")',
    weaponByte: 'Weapon must be an integer between 0 and 255 (is: {value})',
    spare2Byte: 'Spare2 must be an integer between 0 and 255 (is: {value})',
    spareByteByte: 'SpareByte must be an integer between 0 and 255 (is: {value})',
    stepCountEight: 'Program must contain exactly 8 stages',
    stepGap: 'Stage {step} has shots although stage {firstZero} already has 0 shots — no gaps allowed',
    stepShotNum: 'Stage {step}: shot count must be an integer between 0 and 32767 (is: {value})',
    stepInfoType: 'Stage {step}: info must be text',
    stepInfoTooLong: 'Stage {step}: info too long: {len} characters (max. 8)',
    stepInfoBadChar: 'Stage {step}: info contains an invalid character "{char}" — only ASCII/Latin-1 allowed',
    stepSil: 'Stage {step}: silhouette must be a letter (A–Z) (is: "{value}")',
    stepCalc: 'Stage {step}: scoring must be a non-zero integer (is: {value})',
    stepFireMethod: 'Stage {step}: fire method must be an uppercase letter (A–Z) (is: "{value}")',
    stepPrintMode: 'Stage {step}: printout must be a letter (A–Z) (is: "{value}")',
    stepTime1: 'Stage {step}: series-fire time must be an integer between 0 and 32767 (is: {value})',
    stepCalcHighscore: 'Stage {step}: low-shot flag must be 0 or 1 (is: {value})',
    stepPosition: 'Stage {step}: position must be 0 (prone), 1 (kneeling) or 2 (standing) (is: {value})',
    stepBreakNotAllowed: 'Stage {step}: "no break" must be 0 or 1 (is: {value})',
  },
  de: {
    prgNumRange: 'Stichnummer muss eine ganze Zahl zwischen 1 und 999 sein (ist: {value})',
    titleType: 'Titel muss ein Text sein',
    titleTooLong: 'Titel zu lang: {len} Zeichen (max. 28)',
    titleBadChar: 'Titel enthält ein ungültiges Zeichen "{char}" — nur ASCII/Latin-1 erlaubt',
    internalIdType: 'Interne Bezeichnung muss ein Text sein',
    internalIdTooLong: 'Interne Bezeichnung zu lang: {len} Zeichen (max. 8)',
    internalIdBadChar: 'Interne Bezeichnung enthält ein ungültiges Zeichen "{char}" — nur ASCII/Latin-1 erlaubt',
    printOffsetRange: 'Papiervorschub muss eine ganze Zahl zwischen −32768 und 32767 sein (ist: {value})',
    printFormatLetter: 'Druckformat muss ein einzelner Buchstabe sein (ist: "{value}")',
    weaponByte: 'Waffe muss eine ganze Zahl zwischen 0 und 255 sein (ist: {value})',
    spare2Byte: 'Spare2 muss eine ganze Zahl zwischen 0 und 255 sein (ist: {value})',
    spareByteByte: 'SpareByte muss eine ganze Zahl zwischen 0 und 255 sein (ist: {value})',
    stepCountEight: 'Programm muss genau 8 Passen enthalten',
    stepGap: 'Passe {step} hat Schüsse, obwohl Passe {firstZero} bereits 0 Schüsse hat — keine Lücken erlaubt',
    stepShotNum: 'Passe {step}: Anzahl Schüsse muss eine ganze Zahl zwischen 0 und 32767 sein (ist: {value})',
    stepInfoType: 'Passe {step}: Info muss ein Text sein',
    stepInfoTooLong: 'Passe {step}: Info zu lang: {len} Zeichen (max. 8)',
    stepInfoBadChar: 'Passe {step}: Info enthält ein ungültiges Zeichen "{char}" — nur ASCII/Latin-1 erlaubt',
    stepSil: 'Passe {step}: Silhouette muss ein Buchstabe (A–Z) sein (ist: "{value}")',
    stepCalc: 'Passe {step}: Wertung muss eine ganze Zahl ungleich 0 sein (ist: {value})',
    stepFireMethod: 'Passe {step}: Feuerart muss ein Grossbuchstabe (A–Z) sein (ist: "{value}")',
    stepPrintMode: 'Passe {step}: Ausdruck muss ein Buchstabe (A–Z) sein (ist: "{value}")',
    stepTime1: 'Passe {step}: Zeit für Seriefeuer muss eine ganze Zahl zwischen 0 und 32767 sein (ist: {value})',
    stepCalcHighscore: 'Passe {step}: Tiefschuss muss 0 oder 1 sein (ist: {value})',
    stepPosition: 'Passe {step}: Stellung muss 0 (liegend), 1 (kniend) oder 2 (stehend) sein (ist: {value})',
    stepBreakNotAllowed: 'Passe {step}: „Break nicht erlaubt“ muss 0 oder 1 sein (ist: {value})',
  },
  fr: {
    prgNumRange: 'Le numéro de programme doit être un entier entre 1 et 999 (valeur : {value})',
    titleType: 'Le titre doit être du texte',
    titleTooLong: 'Titre trop long : {len} caractères (max. 28)',
    titleBadChar: 'Le titre contient un caractère invalide « {char} » — seul ASCII/Latin-1 est autorisé',
    internalIdType: 'L’ID interne doit être du texte',
    internalIdTooLong: 'ID interne trop long : {len} caractères (max. 8)',
    internalIdBadChar: 'L’ID interne contient un caractère invalide « {char} » — seul ASCII/Latin-1 est autorisé',
    printOffsetRange: 'L’avance papier doit être un entier entre −32768 et 32767 (valeur : {value})',
    printFormatLetter: 'Le format d’impression doit être une seule lettre (valeur : « {value} »)',
    weaponByte: 'L’arme doit être un entier entre 0 et 255 (valeur : {value})',
    spare2Byte: 'Spare2 doit être un entier entre 0 et 255 (valeur : {value})',
    spareByteByte: 'SpareByte doit être un entier entre 0 et 255 (valeur : {value})',
    stepCountEight: 'Le programme doit contenir exactement 8 passes',
    stepGap: 'La passe {step} contient des coups alors que la passe {firstZero} en a déjà 0 — aucun trou autorisé',
    stepShotNum: 'Passe {step} : le nombre de coups doit être un entier entre 0 et 32767 (valeur : {value})',
    stepInfoType: 'Passe {step} : l’info doit être du texte',
    stepInfoTooLong: 'Passe {step} : info trop longue : {len} caractères (max. 8)',
    stepInfoBadChar: 'Passe {step} : l’info contient un caractère invalide « {char} » — seul ASCII/Latin-1 est autorisé',
    stepSil: 'Passe {step} : la silhouette doit être une lettre (A–Z) (valeur : « {value} »)',
    stepCalc: 'Passe {step} : la cotation doit être un entier différent de 0 (valeur : {value})',
    stepFireMethod: 'Passe {step} : le mode de tir doit être une lettre majuscule (A–Z) (valeur : « {value} »)',
    stepPrintMode: 'Passe {step} : l’impression doit être une lettre (A–Z) (valeur : « {value} »)',
    stepTime1: 'Passe {step} : le temps de tir en série doit être un entier entre 0 et 32767 (valeur : {value})',
    stepCalcHighscore: 'Passe {step} : l’indicateur coups bas doit être 0 ou 1 (valeur : {value})',
    stepPosition: 'Passe {step} : la position doit être 0 (couché), 1 (à genou) ou 2 (debout) (valeur : {value})',
    stepBreakNotAllowed: 'Passe {step} : « pas de pause » doit être 0 ou 1 (valeur : {value})',
  },
};

export function formatValidationError(error, lang = 'en') {
  const dict = VALIDATION_MESSAGES[lang] || VALIDATION_MESSAGES.en;
  const template = dict[error.code] ?? VALIDATION_MESSAGES.en[error.code] ?? error.code;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(error.params?.[key] ?? ''));
}

// ── Binary .dat <-> program-object conversion ────────────────────────────────
// VBA Type ProgramDat, 328 bytes per record, little-endian:
//   0    2  PrgNum            18  16  StepTime1[8]      34  32  StepTime2/3[8] (0)
//   66   8  Sil[8]            74  16  Calc[8]           90   8  FireMethod[8]
//   98   8  PrintMode[8]     106  64  Info[8] (*8)     170  16  NextStep[8] (derived)
//   186 16  CalcHighscore[8] 202  16  FireMode[8]      218   8  BreakNotAllowed[8]
//   226 56  passeProgress[8][7]                        282   2  PrintOffset
//   284  1  PrintFormat      285  1  Weapon           286   1  Spare2
//   287  1  spareByte        288   8  Spare3/internalId 296  32  Title (*32)
// Notes: char fields store an ASCII code; ShotNum[]/etc are Integer×8.
// FireMode is VBA's misnomer for "Stellung" (position): binary 1/3/4 <-> UI 0/1/2.
// passeProgress (Spare1) is device-written session data — preserved verbatim.
class DatParser {
  static RECORD_SIZE = 328;

  static parse(arrayBuffer) {
    if (arrayBuffer.byteLength % DatParser.RECORD_SIZE !== 0) {
      throw new Error(`File size ${arrayBuffer.byteLength} is not a multiple of ${DatParser.RECORD_SIZE} bytes`);
    }
    const view = new DataView(arrayBuffer);
    const count = arrayBuffer.byteLength / DatParser.RECORD_SIZE;
    const programs = [];
    for (let i = 0; i < count; i++) {
      const prog = DatParser.#readRecord(view, i * DatParser.RECORD_SIZE);
      // VBA skip condition for empty records: NextStep[0]=0 AND ShotNum[0]=0.
      if (prog._nextStep[0] === 0 && prog.steps[0].shotNum === 0) continue;
      delete prog._nextStep;
      programs.push(prog);
    }
    return programs;
  }

  static serialize(programs) {
    // The device expects records in ascending program-number order; the editor's
    // in-memory list can be in import/edit order, so sort a copy before writing.
    const ordered = [...programs].sort((a, b) => a.prgNum - b.prgNum);
    const buffer = new ArrayBuffer(ordered.length * DatParser.RECORD_SIZE);
    const view = new DataView(buffer);
    ordered.forEach((prog, i) => DatParser.#writeRecord(view, i * DatParser.RECORD_SIZE, prog));
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
      title:       stripPrgNumPrefix(rs(296, 32), prgNum),
      internalId:  rs(288, 8),
      printOffset: ri(282),
      printFormat: byteToChar(rb(284)),
      weapon:      rb(285),
      spare2:      rb(286),
      spareByte:   rb(287),
      passeProgress: Array.from({ length: 8 }, (_, s) => rs(226 + s * 7, 7)),
      steps: Array.from({ length: 8 }, (_, i) => ({
        shotNum:         ri(2   + i * 2),
        info:            rs(106 + i * 8, 8),
        sil:             byteToChar(rb(66 + i)),
        calc:            ri(74  + i * 2),
        fireMethod:      byteToChar(rb(90 + i)),
        printMode:       byteToChar(rb(98 + i)),
        stepTime1:       ri(18  + i * 2),
        calcHighscore:   ri(186 + i * 2),
        position:        binaryPositionToUi(ri(202 + i * 2)),
        breakNotAllowed: rb(218 + i),
      })),
      _nextStep: Array.from({ length: 8 }, (_, i) => ri(170 + i * 2)),
    };
  }

  static #writeRecord(view, off, prog) {
    const wi = (o, v) => view.setInt16(off + o, v, true);
    const wb = (o, v) => view.setUint8(off + o, v);
    // Sanitize codepoints > 255 to '?' (VBA StrConv ANSI fallback) as a backstop
    // if an unvalidated program is serialized directly.
    const ws = (o, n, s) => {
      const padded = String(s ?? '').padEnd(n, ' ').slice(0, n);
      for (let k = 0; k < n; k++) {
        const cc = padded.charCodeAt(k);
        view.setUint8(off + o + k, cc > 255 ? 0x3F : cc);
      }
    };

    wi(0, prog.prgNum);
    prog.steps.forEach((s, i) => {
      wi(2   + i * 2, s.shotNum);
      wi(18  + i * 2, s.stepTime1);
      wi(34  + i * 2, 0);
      wi(50  + i * 2, 0);
      wb(66  + i,     charToByte(s.sil));
      wi(74  + i * 2, s.calc);
      wb(90  + i,     charToByte(s.fireMethod));
      wb(98  + i,     charToByte(s.printMode));
      ws(106 + i * 8, 8, s.info || defaultStepInfo(s));
      wi(170 + i * 2, i < 7 && prog.steps[i + 1].shotNum > 0 ? 1 : 0);
      wi(186 + i * 2, s.calcHighscore);
      wi(202 + i * 2, uiPositionToBinary(s.position));
      wb(218 + i,     s.breakNotAllowed);
    });

    for (let s = 0; s < 8; s++) {
      const row = String(prog.passeProgress?.[s] ?? '').padEnd(7, ' ').slice(0, 7);
      for (let j = 0; j < 7; j++) view.setUint8(off + 226 + s * 7 + j, row.charCodeAt(j));
    }

    wi(282, prog.printOffset);
    wb(284, charToByte(prog.printFormat));
    wb(285, prog.weapon);
    wb(286, prog.spare2);
    wb(287, prog.spareByte);
    ws(288, 8, prog.internalId);
    ws(296, 32, addPrgNumPrefix(prog.title, prog.prgNum));
  }
}

// Position: binary 1=prone, 3=kneeling, 4=standing <-> UI 0/1/2.
const binaryPositionToUi = (v) => (v === 3 ? 1 : v === 4 ? 2 : 0);
const uiPositionToBinary = (v) => (v === 1 ? 3 : v === 2 ? 4 : 1);

// Titles are stored on-disk as "NNN " + title; JSON keeps only the bare title.
const prgNumPrefix = (prgNum) => String(prgNum).padStart(3, '0') + ' ';
const stripPrgNumPrefix = (title, prgNum) => {
  const prefix = prgNumPrefix(prgNum);
  return title.startsWith(prefix) ? title.slice(prefix.length) : title;
};
const addPrgNumPrefix = (title, prgNum) => {
  const prefix = prgNumPrefix(prgNum);
  const clean = String(title ?? '');
  return prefix + (clean.startsWith(prefix) ? clean.slice(prefix.length) : clean);
};

const byteToChar = (b) => (b >= 32 ? String.fromCharCode(b) : '');
const charToByte = (c) => (typeof c === 'string' && c.length > 0 ? c.charCodeAt(0) : 0);

// ── JSON envelope ────────────────────────────────────────────────────────────
// Self-identifying, versioned wrapper shared by the JSON files, the CLI, the
// app's sessionStorage, and clipboard copy/paste.
export const STICHE_FORMAT = 'sintro-programs';
export const STICHE_VERSION = 1;

export function wrapPrograms(programs) {
  return { format: STICHE_FORMAT, version: STICHE_VERSION, programs };
}

// Returns the programs array from an envelope, or null if unrecognizable.
export function unwrapPrograms(data) {
  if (data && typeof data === 'object' && Array.isArray(data.programs)) return data.programs;
  return null;
}

// ── Persistence (Node: JSON file, browser: sessionStorage) ───────────────────
class ProgramStore {
  static STORAGE_KEY = 'sintro_programs';

  static async save(programs, filePath = 'programs.json') {
    const json = JSON.stringify(wrapPrograms(programs), null, 2);
    if (isNode()) {
      const { writeFileSync } = await import('fs');
      writeFileSync(filePath, json, 'utf8');
      console.log(`Saved ${programs.length} programs to ${filePath}`);
    } else {
      sessionStorage.setItem(ProgramStore.STORAGE_KEY, json);
    }
  }

  static async load(filePath = 'programs.json') {
    if (isNode()) {
      const { readFileSync } = await import('fs');
      const programs = unwrapPrograms(JSON.parse(readFileSync(filePath, 'utf8')));
      if (programs == null) {
        throw new Error(`Unrecognized JSON in ${filePath}: expected ` +
          `{ format: "${STICHE_FORMAT}", version: ${STICHE_VERSION}, programs: [...] }.`);
      }
      return programs;
    }
    const json = sessionStorage.getItem(ProgramStore.STORAGE_KEY);
    return json ? (unwrapPrograms(JSON.parse(json)) ?? []) : [];
  }
}

const isNode = () => typeof process !== 'undefined' && process.versions?.node != null;

export function serializePrograms(programs) {
  return DatParser.serialize(programs);
}

export function validateProgram(prog) {
  return ProgramValidator.validate(prog);
}

// Readable per-step label derived from the step's own fields (e.g. "A5-P99").
// Used as the empty-info fallback at serialize time and as the editor
// placeholder. Falls back to a dash-less form when it would exceed 8 chars.
export function defaultStepInfo(step) {
  if (!step || !(step.shotNum > 0)) return '';
  const dashed = `${step.sil}${step.calc}-${step.fireMethod}${step.shotNum}`;
  return dashed.length <= 8 ? dashed : dashed.replace('-', '').slice(0, 8);
}

// Factory for a new program. spareByte defaults to 49 (ASCII '1', the common
// real-world value); passeProgress is blank (the device fills it on first use).
export function createProgram(prgNum) {
  const defaultStep = {
    shotNum: 0, info: '', sil: 'A', calc: 5, fireMethod: 'E',
    printMode: 'N', stepTime1: 0, calcHighscore: 0, position: 0, breakNotAllowed: 1,
  };
  return {
    prgNum,
    title: '',
    internalId: '',
    printOffset: 0,
    printFormat: 'Z',
    weapon: 0,
    spare2: 0,
    spareByte: 49,
    passeProgress: Array.from({ length: 8 }, () => '       '),
    steps: Array.from({ length: 8 }, () => ({ ...defaultStep })),
  };
}

// Parse a .dat, validate every program, persist as JSON. Returns
// { programs, validationErrors } where validationErrors maps prgNum -> [{code, params}].
export async function importDat(arrayBuffer, jsonFilePath = 'programs.json') {
  const programs = DatParser.parse(arrayBuffer);
  const validationErrors = collectValidationErrors(programs);
  await ProgramStore.save(programs, jsonFilePath);
  return { programs, validationErrors };
}

// Load programs, validate, and return a .dat ArrayBuffer. Throws (with a
// .validationErrors map attached) if any program is invalid.
export async function exportDat(jsonFilePath = 'programs.json') {
  const programs = await ProgramStore.load(jsonFilePath);
  const validationErrors = collectValidationErrors(programs);
  if (Object.keys(validationErrors).length > 0) {
    throw Object.assign(new Error('Validation failed — fix errors before exporting'), { validationErrors });
  }
  return DatParser.serialize(programs);
}

function collectValidationErrors(programs) {
  const validationErrors = {};
  for (const prog of programs) {
    const errs = ProgramValidator.validate(prog);
    if (errs.length > 0) validationErrors[prog.prgNum] = errs;
  }
  return validationErrors;
}

// ── Node CLI (only when run directly) ────────────────────────────────────────
//   node sticheditor.js dat-to-json <input.dat>  <output.json>
//   node sticheditor.js json-to-dat <input.json> <output.dat>
if (isNode()) {
  const { fileURLToPath } = await import('url');
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { readFileSync, writeFileSync } = await import('fs');
    const [, , command, inFile, outFile] = process.argv;
    const USAGE = [
      'Usage:',
      '  node sticheditor.js dat-to-json <input.dat>  <output.json>',
      '  node sticheditor.js json-to-dat <input.json> <output.dat>',
    ].join('\n');
    const assertExt = (file, ext, role) => {
      if (!file.toLowerCase().endsWith(ext)) {
        console.error(`Error: expected ${role} file with extension ${ext}, got: ${file}`);
        process.exit(1);
      }
    };
    const printErrors = (validationErrors, log) => {
      for (const [num, errs] of Object.entries(validationErrors)) {
        log(`  Program ${num}:\n    ${errs.map(e => formatValidationError(e, 'en')).join('\n    ')}`);
      }
    };

    if (command === 'dat-to-json') {
      if (!inFile || !outFile) { console.error(USAGE); process.exit(1); }
      assertExt(inFile, '.dat', 'input');
      assertExt(outFile, '.json', 'output');
      const buf = readFileSync(inFile);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const { programs, validationErrors } = await importDat(ab, outFile);
      console.log(`Parsed ${programs.length} programs from ${inFile} → ${outFile}`);
      const entries = Object.entries(validationErrors);
      if (entries.length > 0) {
        console.warn(`Validation warnings in ${entries.length} program(s):`);
        printErrors(validationErrors, console.warn);
      } else {
        console.log('All programs valid.');
      }
    } else if (command === 'json-to-dat') {
      if (!inFile || !outFile) { console.error(USAGE); process.exit(1); }
      assertExt(inFile, '.json', 'input');
      assertExt(outFile, '.dat', 'output');
      try {
        const buffer = await exportDat(inFile);
        writeFileSync(outFile, Buffer.from(buffer));
        console.log(`Wrote ${outFile}`);
      } catch (e) {
        console.error(`Error: ${e.message}`);
        if (e.validationErrors) printErrors(e.validationErrors, console.error);
        process.exit(1);
      }
    } else {
      console.error(USAGE);
      process.exit(1);
    }
  }
}
