import { digitsOnly, normalizeArabic } from '@/lib/arabic';
import type { User } from '../types';

/**
 * Matches a user by name (Arabic-normalized) or by a fragment of the phone
 * number / identity number (digits are normalized so Arabic-Indic input works).
 */
export function searchUsers(users: User[], query: string): User[] {
  const needle = normalizeArabic(query);
  if (!needle) return users;

  const needleDigits = digitsOnly(query);

  return users.filter((user) => {
    if (normalizeArabic(user.name).includes(needle)) return true;
    if (!needleDigits) return false;
    return (
      digitsOnly(user.phone).includes(needleDigits) ||
      digitsOnly(user.identity).includes(needleDigits)
    );
  });
}

/** Finds users whose phone number contains the typed digits (minimum 3). */
export function findUsersByPhone(users: User[], query: string): User[] {
  const needle = digitsOnly(query);
  if (needle.length < 3) return [];
  return users.filter((user) => digitsOnly(user.phone).includes(needle));
}
