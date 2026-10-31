import { Search, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

type NameLookupCardProps = {
  query: string;
  onChange: (value: string) => void;
  exampleName?: string;
};

export function NameLookupCard({ query, onChange, exampleName }: NameLookupCardProps) {
  return (
    <div className="lookup-card">
      <span className="lookup-card__icon" aria-hidden="true">
        <Search size={22} />
      </span>
      <h2>ابحث بالاسم</h2>
      <p className="lookup-card__desc">
        اكتب الاسم كاملاً أو جزءاً منه، وسيظهر السجل المطابق فوراً أثناء الكتابة.
      </p>

      <div className="lookup-field">
        <label htmlFor="name-search">الاسم</label>
        <div className="search search--dark">
          <Search size={18} aria-hidden="true" />
          <input
            id="name-search"
            className="search__input"
            type="search"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            placeholder="مثال: أحمد محمد العلي"
            autoComplete="off"
            maxLength={80}
            aria-describedby="name-search-hint"
          />
          {query ? (
            <button
              type="button"
              className="search__clear search__clear--dark"
              onClick={() => onChange('')}
              aria-label="مسح الاسم"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        <div className="lookup-hints" id="name-search-hint">
          <span>يقبل الحروف العربية والإنجليزية</span>
          {exampleName ? (
            <button type="button" className="hint-action" onClick={() => onChange(exampleName)}>
              تجربة مثال
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
