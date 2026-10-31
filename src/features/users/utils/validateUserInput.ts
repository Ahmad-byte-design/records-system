import { normalizeArabic } from '@/lib/arabic';
import type { NewUserInput, User } from '../types';

export type UserFormErrors = Partial<Record<keyof NewUserInput, string>>;

/**
 * Shared validation for the add and edit dialogs. When `editingId` is given,
 * that record is excluded from the duplicate-username check so a user can be
 * saved without changing their username.
 */
export function validateUserInput(
  values: NewUserInput,
  users: User[],
  editingId?: number,
): UserFormErrors {
  const errors: UserFormErrors = {};
  const name = values.name.trim();
  const username = values.username.trim();
  const password = values.password.trim();

  if (name.length < 2) {
    errors.name = 'اكتب الاسم الكامل (حرفان على الأقل).';
  }

  if (username.length < 2) {
    errors.username = 'اكتب اسم المستخدم (حرفان على الأقل).';
  } else if (
    users.some(
      (user) =>
        user.id !== editingId &&
        normalizeArabic(user.username) === normalizeArabic(username),
    )
  ) {
    errors.username = 'اسم المستخدم مسجّل مسبقاً.';
  }

  if (!password) {
    errors.password = 'اكتب كلمة المرور.';
  }

  return errors;
}
