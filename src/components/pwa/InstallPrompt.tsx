import { Download, Share, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function InstallPrompt() {
  const { mode, install, dismiss } = useInstallPrompt();

  if (!mode) return null;

  return (
    <aside className="install" aria-label="تثبيت التطبيق">
      <span className="install__icon" aria-hidden="true">
        {mode === 'ios' ? <Share size={16} /> : <Smartphone size={16} />}
      </span>

      <p className="install__copy">
        <strong>ثبّت التطبيق</strong>{' '}
        {mode === 'ios'
          ? 'من زر المشاركة ← «إضافة إلى الشاشة الرئيسية» للوصول السريع دون إنترنت.'
          : 'للوصول السريع إلى سجل المستخدمين حتى دون اتصال.'}
      </p>

      {mode === 'prompt' ? (
        <Button variant="primary" icon={<Download size={15} />} onClick={install}>
          تثبيت
        </Button>
      ) : null}

      <button
        type="button"
        className="install__close"
        onClick={dismiss}
        aria-label="إخفاء اقتراح التثبيت"
      >
        <X size={15} />
      </button>
    </aside>
  );
}
