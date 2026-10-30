import { useEffect, useState } from 'react';

export type AppView = 'users' | 'lookup';

const DEFAULT_HASH = '#/users';

function parseView(): AppView {
  const route = window.location.hash.replace(/^#\/?/, '');
  return route === 'search' || route === 'lookup' ? 'lookup' : 'users';
}

/** Tiny hash router so views survive refreshes and the back button works. */
export function useHashRoute(): AppView {
  const [view, setView] = useState<AppView>(parseView);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, '', DEFAULT_HASH);

    const onChange = () => {
      // In-page anchors such as the skip link (#main) must not change the view.
      if (window.location.hash && !window.location.hash.startsWith('#/')) return;
      setView(parseView());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return view;
}
