import { Database } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="footer">
      <span className="footer__brand">
        <Database size={13} aria-hidden="true" />
        نور الشام للاتصالات — سجل مستخدمين محلي
      </span>
      <span>البيانات محفوظة على هذا الجهاز فقط</span>
    </footer>
  );
}
