import { Search, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

type PhoneLookupCardProps = {
  query: string;
  onChange: (value: string) => void;
  examplePhone?: string;
};

export function PhoneLookupCard({ query, onChange, examplePhone }: PhoneLookupCardProps) {
  return (
    <div className="lookup-card">
      <span className="lookup-card__icon" aria-hidden="true">
        <Search size={22} />
      </span>
      <h2>ابحث برقم الهاتف</h2>
      <p className="lookup-card__desc">
        اكتب الرقم كاملاً أو جزءاً منه، وسيظهر السجل المطابق فوراً أثناء الكتابة.
      </p>

      <div className="lookup-field">
        <label htmlFor="phone-search">رقم الهاتف</label>
        <div className="search search--dark">
          <Search size={18} aria-hidden="true" />
          <input
            id="phone-search"
            className="search__input"
            type="search"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            placeholder="0938 938 300"
            dir="ltr"
            inputMode="tel"
            autoComplete="off"
            maxLength={24}
            aria-describedby="phone-search-hint"
          />
          {query ? (
            <button
              type="button"
              className="search__clear search__clear--dark"
              onClick={() => onChange('')}
              aria-label="مسح رقم البحث"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        <div className="lookup-hints" id="phone-search-hint">
          <span>يقبل الأرقام العربية ٠–٩</span>
          {examplePhone ? (
            <button
              type="button"
              className="hint-action"
              onClick={() => onChange(examplePhone)}
            >
              تجربة مثال
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
