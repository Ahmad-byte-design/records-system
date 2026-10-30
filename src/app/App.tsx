import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { Toaster } from '@/components/ui/Toaster';
import { LookupPage } from '@/features/lookup/pages/LookupPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { useHashRoute } from '@/hooks/useHashRoute';

export function App() {
  const view = useHashRoute();

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        تخطي إلى المحتوى
      </a>
      <AppHeader view={view} />
      <main className="workspace" id="main" tabIndex={-1}>
        <InstallPrompt />
        {view === 'lookup' ? <LookupPage /> : <UsersPage />}
      </main>
      <AppFooter />
      <Toaster />
    </div>
  );
}
