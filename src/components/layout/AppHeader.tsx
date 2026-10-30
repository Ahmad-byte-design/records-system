import { Search, UsersRound } from 'lucide-react';
import type { AppView } from '@/hooks/useHashRoute';
import { cn } from '@/lib/cn';

export function AppHeader({ view }: { view: AppView }) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href="#/users" aria-label="نور الشام للاتصالات — الصفحة الرئيسية">
          <span className="brand__mark" aria-hidden="true">
            ن
          </span>
          <span className="brand__text">
            <span className="brand__name">نور الشام للاتصالات</span>
            <span className="brand__tag">إدارة سجلات المستخدمين</span>
          </span>
        </a>

        <nav className="topbar__nav" aria-label="التنقل الرئيسي">
          <a
            className={cn('topbar__tab', view === 'users' && 'is-active')}
            href="#/users"
            aria-current={view === 'users' ? 'page' : undefined}
          >
            <UsersRound size={16} aria-hidden="true" />
            المستخدمون
          </a>
          <a
            className={cn('topbar__tab', view === 'lookup' && 'is-active')}
            href="#/search"
            aria-current={view === 'lookup' ? 'page' : undefined}
          >
            <Search size={16} aria-hidden="true" />
            البحث
          </a>
        </nav>

        <div className="topbar__meta">
          <span className="pulse-dot" aria-hidden="true" />
          <span>محلي وآمن</span>
        </div>
      </div>
    </header>
  );
}
