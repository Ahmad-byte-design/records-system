import { isoDay } from '@/lib/date';
import { downloadWorkbook } from '@/lib/xlsx';
import type { User } from '../types';

/** Downloads the given users as a styled, RTL Excel sheet. */
export function exportUsers(users: User[]): void {
  downloadWorkbook(
    {
      name: 'المستخدمون',
      columns: [
        { header: 'الرقم', width: 8, numeric: true },
        { header: 'الاسم', width: 28 },
        { header: 'رقم الهاتف', width: 20 },
        { header: 'رقم الهوية', width: 20 },
      ],
      rows: users.map((user) => [user.id, user.name, user.phone, user.identity]),
    },
    `سجل-نور-الشام-${isoDay()}.xlsx`,
  );
}
