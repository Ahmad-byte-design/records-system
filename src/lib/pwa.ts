import { toast } from '@/stores/useToastStore';

/**
 * Registers the build-time service worker and wires the small PWA affordances.
 *
 * Registration is production-only: in development the worker would cache Vite's
 * module graph and hide source edits. Use `npm run build && npm run preview` to
 * exercise the installed/offline experience.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            // A controller means the page is already running an older build.
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.success('تم تحديث التطبيق — أعد تحميل الصفحة لاستخدام أحدث نسخة.');
            }
          });
        });
      })
      .catch(() => {
        /* Offline support is optional; the app keeps working online. */
      });
  });

  window.addEventListener('offline', () => {
    toast.error('انقطع الاتصال — يستمر العمل بالسجل المحلي.');
  });

  window.addEventListener('online', () => {
    toast.success('عاد الاتصال بالإنترنت.');
  });
}
