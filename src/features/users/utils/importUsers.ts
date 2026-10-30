import { digitsOnly, normalizeArabic, toAsciiDigits } from '@/lib/arabic';
import type { NewUserInput, User } from '../types';

export type ImportSummary = {
  /** Non-empty data rows that were examined (header excluded). */
  total: number;
  /** Rows skipped because the phone or identity already exists. */
  duplicates: number;
  /** Rows skipped because they were incomplete or malformed. */
  invalid: number;
};

export type ImportResult = {
  inputs: NewUserInput[];
  summary: ImportSummary;
};

type ColumnMap = {
  name: number;
  phone: number;
  identity: number;
};

function normalizeHeader(value: string): string {
  return normalizeArabic(value).replace(/[^\p{L}\p{N}]+/gu, '');
}

function headerSet(values: string[]): Set<string> {
  return new Set(values.map(normalizeHeader));
}

const NAME_HEADERS = headerSet([
  'الاسم',
  'اسم',
  'الاسم الكامل',
  'اسم المستخدم',
  'اسم العميل',
  'الاسم الثلاثي',
  'name',
  'full name',
  'fullname',
  'user name',
  'username',
  'customer name',
]);

const PHONE_HEADERS = headerSet([
  'رقم الهاتف',
  'الهاتف',
  'هاتف',
  'رقم الموبايل',
  'الموبايل',
  'موبايل',
  'رقم الجوال',
  'الجوال',
  'رقم الواتساب',
  'phone',
  'phone number',
  'phonenumber',
  'mobile',
  'mobile number',
  'mobilenumber',
  'tel',
  'telephone',
]);

const IDENTITY_HEADERS = headerSet([
  'رقم الهوية',
  'الهوية',
  'هوية',
  'رقم الهوية الوطنية',
  'الهوية الوطنية',
  'الرقم الوطني',
  'رقم البطاقة',
  'identity',
  'identity number',
  'identitynumber',
  'national id',
  'nationalid',
  'national number',
  'nationalnumber',
  'id number',
  'idnumber',
]);

function detectHeader(rows: string[][]): { index: number; columns: ColumnMap } | null {
  const limit = Math.min(rows.length, 12);

  for (let index = 0; index < limit; index += 1) {
    const row = rows[index];
    if (!row) continue;
    const columns: Partial<ColumnMap> = {};

    row.forEach((cell, column) => {
      const header = normalizeHeader(cell);
      if (!header) return;
      if (columns.name === undefined && NAME_HEADERS.has(header)) columns.name = column;
      else if (columns.phone === undefined && PHONE_HEADERS.has(header)) columns.phone = column;
      else if (columns.identity === undefined && IDENTITY_HEADERS.has(header)) {
        columns.identity = column;
      }
    });

    if (columns.name !== undefined && columns.phone !== undefined) {
      return {
        index,
        columns: {
          name: columns.name,
          phone: columns.phone,
          identity: columns.identity ?? -1,
        },
      };
    }
  }

  return null;
}

function looksLikeHeader(row: string[]): boolean {
  return row.some((cell) => {
    const header = normalizeHeader(cell);
    return NAME_HEADERS.has(header) || PHONE_HEADERS.has(header) || IDENTITY_HEADERS.has(header);
  });
}

function cell(row: string[], column: number): string {
  return column >= 0 ? (row[column] ?? '') : '';
}

function cleanName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanPhone(value: string): string {
  return toAsciiDigits(value).replace(/\s+/g, ' ').trim();
}

/**
 * Converts worksheet rows into validated, deduplicated users.
 * Header names are matched in Arabic and English; headerless sheets are read
 * positionally as name, phone, identity.
 */
export function buildImport(rows: string[][], existing: User[]): ImportResult {
  const detected = detectHeader(rows);
  const columns: ColumnMap = detected?.columns ?? { name: 0, phone: 1, identity: 2 };
  const firstRow = rows[0];
  const start = detected ? detected.index + 1 : firstRow && looksLikeHeader(firstRow) ? 1 : 0;

  const seenPhones = new Set(existing.map((user) => digitsOnly(user.phone)).filter(Boolean));
  const seenIdentities = new Set(
    existing.map((user) => digitsOnly(user.identity)).filter(Boolean),
  );

  const summary: ImportSummary = { total: 0, duplicates: 0, invalid: 0 };
  const inputs: NewUserInput[] = [];

  for (const row of rows.slice(start)) {
    const name = cleanName(cell(row, columns.name));
    const phone = cleanPhone(cell(row, columns.phone));
    const identity = digitsOnly(cell(row, columns.identity));
    const phoneDigits = digitsOnly(phone);

    if (!name && !phone && !identity) continue;
    summary.total += 1;

    const identityValid = !identity || (identity.length >= 6 && identity.length <= 20);
    if (name.length < 2 || phoneDigits.length < 7 || phoneDigits.length > 15 || !identityValid) {
      summary.invalid += 1;
      continue;
    }

    const duplicate =
      seenPhones.has(phoneDigits) || Boolean(identity && seenIdentities.has(identity));
    if (duplicate) {
      summary.duplicates += 1;
      continue;
    }

    seenPhones.add(phoneDigits);
    if (identity) seenIdentities.add(identity);
    inputs.push({ name, phone, identity });
  }

  return { inputs, summary };
}
