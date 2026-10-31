import { Pencil, SearchX, Trash2, UsersRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { HighlightedText } from '@/components/ui/HighlightedText';
import { formatDate } from '@/lib/date';
import type { User } from '../types';

type UsersTableProps = {
  users: User[];
  query: string;
  onReset: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UsersTable({ users, query, onReset, onEdit, onDelete }: UsersTableProps) {
  if (!users.length) {
    return (
      <div className="table-empty">
        <span className="table-empty__icon" aria-hidden="true">
          {query ? <SearchX size={26} /> : <UsersRound size={26} />}
        </span>
        <h3>{query ? 'لا توجد نتائج مطابقة' : 'لا توجد سجلات بعد'}</h3>
        <p>
          {query
            ? 'جرّب اسماً آخر أو تهجئة مختلفة.'
            : 'أضف أول مستخدم ليظهر هنا.'}
        </p>
        {query ? (
          <button type="button" className="btn btn--secondary" onClick={onReset}>
            مسح البحث
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="users-table">
        <caption className="sr-only">
          سجل المستخدمين: الرقم، الاسم، اسم المستخدم، كلمة المرور، إجراءات
        </caption>
        <thead>
          <tr>
            <th scope="col" className="cell-id">
              الرقم
            </th>
            <th scope="col">الاسم</th>
            <th scope="col">اسم المستخدم</th>
            <th scope="col">كلمة المرور</th>
            <th scope="col" className="cell-actions">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="cell-id">
                <span className="row-id">#{String(user.id).padStart(2, '0')}</span>
              </td>
              <td>
                <div className="user-cell">
                  <Avatar name={user.name} />
                  <div className="user-cell__text">
                    <span className="user-cell__name">
                      <HighlightedText text={user.name} query={query} />
                    </span>
                    <span className="user-cell__meta">أضيف في {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </td>
              <td className="cell-credential">
                <span dir="ltr">{user.username || '—'}</span>
              </td>
              <td className="cell-credential">
                <span dir="ltr">{user.password || '—'}</span>
              </td>
              <td className="cell-actions">
                <div className="cell-actions__group">
                  <button
                    type="button"
                    className="row-edit"
                    onClick={() => onEdit(user)}
                    aria-label={`تعديل ${user.name}`}
                    title="تعديل السجل"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="row-delete"
                    onClick={() => onDelete(user)}
                    aria-label={`حذف ${user.name}`}
                    title="حذف السجل"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
