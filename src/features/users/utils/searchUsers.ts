import { normalizeArabic } from '@/lib/arabic';
import type { User } from '../types';

/**
 * Matches users by name. Arabic folding makes `احمد` find `أحمد` and ignores
 * diacritics, while Latin names match case-insensitively.
 */
export function searchUsers(users: User[], query: string): User[] {
  const needle = normalizeArabic(query);
  if (!needle) return users;

  return users.filter((user) => normalizeArabic(user.name).includes(needle));
}

/** Finds users by name once at least two characters have been typed. */
export function findUsersByName(users: User[], query: string): User[] {
  const needle = normalizeArabic(query);
  if (needle.length < 2) return [];
  return users.filter((user) => normalizeArabic(user.name).includes(needle));
}

function timestamp(value: string): number {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

/** Returns a copy ordered newest first, with the highest id breaking ties. */
export function sortNewestFirst(users: User[]): User[] {
  return [...users].sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt) || b.id - a.id);
}
