import { AlertCircle, Check, X } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">
          <span className="toast__icon" aria-hidden="true">
            {toast.tone === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(toast.id)}
            aria-label="إغلاق الإشعار"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
