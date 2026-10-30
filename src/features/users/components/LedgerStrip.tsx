type LedgerStripProps = {
  total: number;
  latestName?: string;
};

export function LedgerStrip({ total, latestName }: LedgerStripProps) {
  return (
    <dl className="ledger">
      <div className="ledger__item">
        <dt>إجمالي السجلات</dt>
        <dd className="ledger__total">{String(total).padStart(2, '0')}</dd>
      </div>
      <div className="ledger__item">
        <dt>آخر إضافة</dt>
        <dd>{latestName ?? 'لا توجد سجلات بعد'}</dd>
      </div>
      <div className="ledger__item ledger__item--status">
        <dt>حالة التخزين</dt>
        <dd className="ledger__status">
          <span className="ledger__dot" aria-hidden="true" />
          محفوظ على هذا الجهاز
        </dd>
      </div>
    </dl>
  );
}
