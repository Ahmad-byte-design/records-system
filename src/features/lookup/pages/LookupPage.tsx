import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUserStore } from '@/features/users/store/useUserStore';
import { findUsersByPhone } from '@/features/users/utils/searchUsers';
import { digitsOnly } from '@/lib/arabic';
import { LookupResult } from '../components/LookupResult';
import { PhoneLookupCard } from '../components/PhoneLookupCard';
import '../lookup.css';

export function LookupPage() {
  const users = useUserStore((state) => state.users);
  const [query, setQuery] = useState('');

  const matches = useMemo(() => findUsersByPhone(users, query), [users, query]);
  const user = matches[0];
  const examplePhone = users[0]?.phone ?? '0938 938 300';
  const status = user
    ? `تم العثور على ${user.name}`
    : digitsOnly(query).length >= 3
      ? 'لا يوجد مستخدم مطابق لهذا الرقم'
      : '';

  return (
    <div className="page">
      <PageHeader
        eyebrow="الوصول السريع"
        title="البحث عن مستخدم"
        description="حقل واحد يكفي: أدخل رقم الهاتف للوصول الفوري إلى سجل المستخدم وبياناته."
      />

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <section className="lookup-grid" aria-label="البحث برقم الهاتف">
        <PhoneLookupCard query={query} onChange={setQuery} examplePhone={examplePhone} />

        <div className="panel lookup-result">
          <LookupResult
            user={user}
            matchCount={matches.length}
            query={query}
            onClear={() => setQuery('')}
          />
        </div>
      </section>

      <p className="lookup-footnote">
        <Info size={14} aria-hidden="true" />
        البحث فوري ويطابق الأرقام العربية والإنجليزية، مع تجاهل المسافات والرموز.
      </p>
    </div>
  );
}
