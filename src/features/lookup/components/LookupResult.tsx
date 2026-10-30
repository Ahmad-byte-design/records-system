import { CheckCircle2, Copy, Fingerprint, SearchX } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { digitsOnly } from '@/lib/arabic';
import { formatDate } from '@/lib/date';
import { toast } from '@/stores/useToastStore';
import type { User } from '@/features/users/types';

type LookupResultProps = {
  user?: User;
  matchCount: number;
  query: string;
  onClear: () => void;
};

async function copyValue(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('تم نسخ الرقم');
  } catch {
    toast.error('تعذّر النسخ في هذا المتصفح');
  }
}

export function LookupResult({ user, matchCount, query, onClear }: LookupResultProps) {
  const typedDigits = digitsOnly(query).length;

  if (!user) {
    const isPartial = typedDigits > 0 && typedDigits < 3;
    const isMissing = typedDigits >= 3;

    return (
      <div className="result-idle">
        <div className="result-rings" aria-hidden="true">
          <span className="result-rings__core">
            {isMissing ? <SearchX size={24} /> : <Fingerprint size={24} />}
          </span>
        </div>
        <h3>
          {isMissing
            ? 'لا يوجد سجل مطابق'
            : isPartial
              ? 'أكمل كتابة الرقم'
              : 'نتيجة البحث ستظهر هنا'}
        </h3>
        <p>
          {isMissing
            ? 'تأكد من رقم الهاتف أو جرّب جزءاً آخر منه. يمكنك أيضاً استعراض السجل كاملاً.'
            : isPartial
              ? 'أدخل 3 أرقام على الأقل لبدء البحث عن المستخدم.'
              : 'اكتب رقم الهاتف في الحقل المقابل، أو جزءاً منه، للوصول إلى بيانات المستخدم.'}
        </p>
        {isMissing ? (
          <div className="result-idle__actions">
            <button type="button" className="btn btn--secondary" onClick={onClear}>
              مسح البحث
            </button>
            <a className="btn btn--ghost" href="#/users">
              عرض جميع المستخدمين
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="result-found">
      <div className="result-status">
        <span className="result-status__tag">سجل مطابق</span>
        {matchCount > 1 ? (
          <span className="result-status__more">عرض أول نتيجة من {matchCount}</span>
        ) : (
          <span className="result-status__more">تطابق فريد</span>
        )}
      </div>

      <div className="result-person">
        <Avatar name={user.name} size="lg" />
        <div>
          <h2>{user.name}</h2>
          <p>سجل #{String(user.id).padStart(2, '0')}</p>
        </div>
      </div>

      <dl className="result-rows">
        <div className="result-row">
          <dt>رقم الهاتف</dt>
          <dd>
            <span className="mono" dir="ltr">
              {user.phone}
            </span>
            <button
              type="button"
              className="result-copy"
              onClick={() => copyValue(user.phone)}
              aria-label="نسخ رقم الهاتف"
            >
              <Copy size={13} />
            </button>
          </dd>
        </div>
        <div className="result-row">
          <dt>رقم الهوية</dt>
          <dd>
            {user.identity ? (
              <>
                <span className="mono" dir="ltr">
                  {user.identity}
                </span>
                <button
                  type="button"
                  className="result-copy"
                  onClick={() => copyValue(user.identity)}
                  aria-label="نسخ رقم الهوية"
                >
                  <Copy size={13} />
                </button>
              </>
            ) : (
              <span className="mono">—</span>
            )}
          </dd>
        </div>
        <div className="result-row">
          <dt>تاريخ الإضافة</dt>
          <dd className="result-date">{formatDate(user.createdAt)}</dd>
        </div>
      </dl>

      <p className="result-note">
        <CheckCircle2 size={14} aria-hidden="true" />
        البيانات معروضة من السجل المحفوظ على هذا الجهاز.
      </p>
    </div>
  );
}
