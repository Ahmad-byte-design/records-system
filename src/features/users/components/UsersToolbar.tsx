import { useEffect, useRef, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';

type UsersToolbarProps = {
  query: string;
  onChange: (value: string) => void;
};

export function UsersToolbar({ query, onChange }: UsersToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="search" role="search">
      <Search size={17} aria-hidden="true" />
      <input
        ref={inputRef}
        className="search__input"
        type="search"
        value={query}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder="ابحث بالاسم…"
        maxLength={60}
        aria-label="البحث في المستخدمين بالاسم"
        autoComplete="off"
        spellCheck={false}
      />
      {query ? (
        <button
          type="button"
          className="search__clear"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="مسح البحث"
        >
          <X size={14} />
        </button>
      ) : (
        <kbd className="search__hint" aria-hidden="true">
          /
        </kbd>
      )}
    </div>
  );
}
