/**
 * Arabic-aware text helpers used by search and highlighting.
 *
 * Folding removes diacritics/tatweel, unifies alef/ya/ta-marbuta forms, maps
 * Arabic-Indic and Persian digits to ASCII, and collapses whitespace. Folding is
 * what makes "احمد" match "أحمد" and "٠٩٣٨" match "0938".
 */

const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;
const TATWEEL = '\u0640';

const DIGIT_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

const LETTER_MAP: Record<string, string> = {
  أ: 'ا',
  إ: 'ا',
  آ: 'ا',
  ٱ: 'ا',
  ى: 'ي',
  ئ: 'ي',
  ؤ: 'و',
  ة: 'ه',
  ک: 'ك',
  ی: 'ي',
  ۀ: 'ه',
};

function foldChar(char: string): string {
  return DIGIT_MAP[char] ?? LETTER_MAP[char] ?? char.toLowerCase();
}

function isIgnored(char: string): boolean {
  return char === TATWEEL || DIACRITICS.test(char);
}

export type FoldedText = {
  /** Normalized text used for comparisons. */
  text: string;
  /** For every folded character, its offset in the original string. */
  indexMap: number[];
};

/** Normalizes text while keeping a map back to the original offsets. */
export function foldWithIndex(value: string): FoldedText {
  let text = '';
  const indexMap: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === undefined || isIgnored(char)) continue;

    const folded = foldChar(char);
    if (/\s/.test(folded)) {
      if (text.length === 0 || text.endsWith(' ')) continue;
      text += ' ';
      indexMap.push(index);
      continue;
    }

    for (const part of folded) {
      text += part;
      indexMap.push(index);
    }
  }

  return { text, indexMap };
}

/** Normalizes Arabic/Latin text for loose comparison. */
export function normalizeArabic(value: string): string {
  return foldWithIndex(value).text.trim();
}

/** Returns only the digits of a value after Arabic-Indic normalization. */
export function digitsOnly(value: string): string {
  let digits = '';
  for (const char of value) {
    const folded = foldChar(char);
    if (folded >= '0' && folded <= '9') digits += folded;
  }
  return digits;
}

/** Converts Arabic-Indic digits to ASCII while keeping every other character. */
export function toAsciiDigits(value: string): string {
  let output = '';
  for (const char of value) {
    output += DIGIT_MAP[char] ?? char;
  }
  return output;
}

export type HighlightPart = { text: string; match: boolean };

/** Splits text into plain/matched parts for the first occurrence of a query. */
export function splitHighlight(text: string, query: string): HighlightPart[] {
  const needle = normalizeArabic(query);
  if (!needle) return [{ text, match: false }];

  const folded = foldWithIndex(text);
  const at = folded.text.indexOf(needle);
  if (at === -1) return [{ text, match: false }];

  const start = folded.indexMap[at];
  const end = folded.indexMap[at + needle.length - 1];
  if (start === undefined || end === undefined) return [{ text, match: false }];

  const parts: HighlightPart[] = [];
  if (start > 0) parts.push({ text: text.slice(0, start), match: false });
  parts.push({ text: text.slice(start, end + 1), match: true });
  if (end + 1 < text.length) parts.push({ text: text.slice(end + 1), match: false });
  return parts;
}
