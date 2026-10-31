import { normalizeArabic } from '@/lib/arabic';
import type { NewUserInput, User } from '../types';

export type ImportSummary = {
  /** Non-empty data rows that were examined (header excluded). */
  total: number;
  /** Rows skipped because the username already exists. */
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
  username: number;
  password: number;
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
  'اسم العميل',
  'الاسم الثلاثي',
  'name',
  'full name',
  'fullname',
  'customer name',
]);

const USERNAME_HEADERS = headerSet([
  'اسم المستخدم',
  'المستخدم',
  'اسم الدخول',
  'حساب المستخدم',
  'يوزر',
  'username',
  'user name',
  'userid',
  'user id',
  'login',
  'login name',
]);

const PASSWORD_HEADERS = headerSet([
  'كلمة المرور',
  'كلمة السر',
  'المرور',
  'السر',
  'باسورد',
  'password',
  'pass',
  'passcode',
  'pwd',
]);

/** Older sheets used phone/identity; keep reading them as username/password. */
const LEGACY_USERNAME_HEADERS = headerSet([
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

const LEGACY_PASSWORD_HEADERS = headerSet([
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
      else if (columns.username === undefined && USERNAME_HEADERS.has(header)) {
        columns.username = column;
      } else if (columns.password === undefined && PASSWORD_HEADERS.has(header)) {
        columns.password = column;
      }
    });

    // Fall back to the pre-credentials phone/identity columns.
    row.forEach((cell, column) => {
      const header = normalizeHeader(cell);
      if (columns.username === undefined && LEGACY_USERNAME_HEADERS.has(header)) {
        columns.username = column;
      } else if (columns.password === undefined && LEGACY_PASSWORD_HEADERS.has(header)) {
        columns.password = column;
      }
    });

    if (columns.name !== undefined && columns.username !== undefined) {
      return {
        index,
        columns: {
          name: columns.name,
          username: columns.username,
          password: columns.password ?? -1,
        },
      };
    }
  }

  return null;
}

function looksLikeHeader(row: string[]): boolean {
  return row.some((cell) => {
    const header = normalizeHeader(cell);
    return (
      NAME_HEADERS.has(header) ||
      USERNAME_HEADERS.has(header) ||
      PASSWORD_HEADERS.has(header) ||
      LEGACY_USERNAME_HEADERS.has(header) ||
      LEGACY_PASSWORD_HEADERS.has(header)
    );
  });
}

function cell(row: string[], column: number): string {
  return column >= 0 ? (row[column] ?? '') : '';
}

function cleanLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanSecret(value: string): string {
  return value.trim();
}

/**
 * Converts worksheet rows into validated, deduplicated users.
 * Header names are matched in Arabic and English; headerless sheets are read
 * positionally as name, username, password. Older phone/identity headers are
 * still accepted as username/password aliases.
 */
export function buildImport(rows: string[][], existing: User[]): ImportResult {
  const detected = detectHeader(rows);
  const columns: ColumnMap = detected?.columns ?? { name: 0, username: 1, password: 2 };
  const firstRow = rows[0];
  const start = detected ? detected.index + 1 : firstRow && looksLikeHeader(firstRow) ? 1 : 0;

  const seenUsernames = new Set(
    existing.map((user) => normalizeArabic(user.username)).filter(Boolean),
  );

  const summary: ImportSummary = { total: 0, duplicates: 0, invalid: 0 };
  const inputs: NewUserInput[] = [];

  for (const row of rows.slice(start)) {
    const name = cleanLabel(cell(row, columns.name));
    const username = cleanLabel(cell(row, columns.username));
    const password = cleanSecret(cell(row, columns.password));

    if (!name && !username && !password) continue;
    summary.total += 1;

    if (name.length < 2 || username.length < 2 || !password) {
      summary.invalid += 1;
      continue;
    }

    const key = normalizeArabic(username);
    if (seenUsernames.has(key)) {
      summary.duplicates += 1;
      continue;
    }

    seenUsernames.add(key);
    inputs.push({ name, username, password });
  }

  return { inputs, summary };
}
