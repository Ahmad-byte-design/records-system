import { SearchX, UsersRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { HighlightedText } from '@/components/ui/HighlightedText';
import { formatDate } from '@/lib/date';
import type { User } from '../types';

type UsersTableProps = {
  users: User[];
  query: string;
  onReset: () => void;
};

export function UsersTable({ users, query, onReset }: UsersTableProps) {
  if (!users.length) {
    return (
      <div className="table-empty">
        <span className="table-empty__icon" aria-hidden="true">
          {query ? <SearchX size={26} /> : <UsersRound size={26} />}
        </span>
        <h3>{query ? 'لا توجد نتائج مطابقة' : 'لا توجد سجلات بعد'}</h3>
        <p>
          {query
            ? 'جرّب اسماً آخر، أو جزءاً من رقم الهاتف أو رقم الهوية.'
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
          سجل المستخدمين: الرقم، الاسم، رقم الهاتف، رقم الهوية
        </caption>
        <thead>
          <tr>
            <th scope="col" className="cell-id">
              الرقم
            </th>
            <th scope="col">الاسم</th>
            <th scope="col">رقم الهاتف</th>
            <th scope="col">رقم الهوية</th>
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
              <td className="cell-numeric">
                <span dir="ltr">
                  <HighlightedText text={user.phone} query={query} />
                </span>
              </td>
              <td className="cell-numeric">
                <span dir="ltr">
                  {user.identity ? (
                    <HighlightedText text={user.identity} query={query} />
                  ) : (
                    '—'
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
