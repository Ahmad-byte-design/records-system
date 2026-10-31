import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUserStore } from '@/features/users/store/useUserStore';
import { findUsersByName, sortNewestFirst } from '@/features/users/utils/searchUsers';
import { normalizeArabic } from '@/lib/arabic';
import { LookupResult } from '../components/LookupResult';
import { NameLookupCard } from '../components/NameLookupCard';
import '../lookup.css';

export function LookupPage() {
  const users = useUserStore((state) => state.users);
  const [query, setQuery] = useState('');

  const matches = useMemo(
    () => sortNewestFirst(findUsersByName(users, query)),
    [users, query],
  );
  const user = matches[0];
  const exampleName = users[0]?.name;
  const status = user
    ? `تم العثور على ${user.name}`
    : normalizeArabic(query).length >= 2
      ? 'لا يوجد مستخدم مطابق لهذا الاسم'
      : '';

  return (
    <div className="page">
      <PageHeader
        eyebrow="الوصول السريع"
        title="البحث عن مستخدم"
        description="حقل واحد يكفي: اكتب الاسم للوصول الفوري إلى بيانات المستخدم وكلمة المرور."
      />

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <section className="lookup-grid" aria-label="البحث بالاسم">
        <NameLookupCard query={query} onChange={setQuery} exampleName={exampleName} />

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
        البحث فوري ويطابق الأسماء مع تجاهل الهمزات والتشكيل واختلاف حالة الأحرف.
      </p>
    </div>
  );
}
