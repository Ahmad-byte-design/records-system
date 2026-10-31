import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { readXlsx } from '@/lib/xlsx-read';
import { toast } from '@/stores/useToastStore';
import { UserFormDialog } from '../components/UserFormDialog';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { LedgerStrip } from '../components/LedgerStrip';
import { UsersTable } from '../components/UsersTable';
import { UsersToolbar } from '../components/UsersToolbar';
import { useUserStore } from '../store/useUserStore';
import type { User } from '../types';
import { exportUsers } from '../utils/exportUsers';
import { buildImport } from '../utils/importUsers';
import { searchUsers, sortNewestFirst } from '../utils/searchUsers';
import '../users.css';

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

function recordsLabel(count: number): string {
  if (count === 1) return 'سجل واحد';
  if (count === 2) return 'سجلين';
  return `${count} سجلات`;
}

export function UsersPage() {
  const users = useUserStore((state) => state.users);
  const importUsers = useUserStore((state) => state.importUsers);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<User | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ordered = useMemo(() => sortNewestFirst(users), [users]);
  const filtered = useMemo(() => searchUsers(ordered, query), [ordered, query]);
  const latest = ordered[0];

  const handleExport = () => {
    if (!filtered.length) return;
    exportUsers(filtered);
    toast.success(`تم تصدير ${filtered.length} سجل إلى ملف Excel`);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteUser(pendingDelete.id);
    toast.success(`تم حذف ${pendingDelete.name} من السجل`);
    setPendingDelete(null);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (/\.xls$/i.test(file.name)) {
      toast.error('صيغة .xls غير مدعومة. احفظ الملف بصيغة .xlsx ثم أعد المحاولة.');
      return;
    }
    if (!/\.xlsx$/i.test(file.name)) {
      toast.error('اختر ملف Excel بصيغة .xlsx.');
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      toast.error('حجم الملف كبير. الحد الأقصى 8 ميغابايت.');
      return;
    }

    setIsImporting(true);
    try {
      const { rows } = await readXlsx(await file.arrayBuffer());
      const { inputs, summary } = buildImport(rows, users);
      const created = importUsers(inputs);
      const ignored = [
        summary.duplicates ? `${summary.duplicates} مكرر` : '',
        summary.invalid ? `${summary.invalid} غير صالح` : '',
      ]
        .filter(Boolean)
        .join(' و');

      if (!created.length) {
        toast.error(
          summary.total
            ? `لم يتم استيراد أي سجل — ${ignored || 'لا توجد صفوف صالحة'}.`
            : 'الملف لا يحتوي على سجلات.',
        );
        return;
      }

      setQuery('');
      toast.success(
        `تم استيراد ${recordsLabel(created.length)}${ignored ? ` وتجاهل ${ignored}` : ''}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === 'DECOMPRESSION_UNSUPPORTED'
          ? 'هذا المتصفح لا يدعم قراءة ملفات Excel.'
          : 'تعذّر قراءة الملف. تأكد أنه ملف Excel سليم بصيغة .xlsx.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="السجل العام"
        title="المستخدمون"
        description="استعرض سجلات المستخدمين، أضف سجلاً جديداً، استورد ملف Excel، أو ابحث بالاسم."
      >
        <Button
          variant="secondary"
          icon={<Upload size={17} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
        >
          {isImporting ? 'جارٍ الاستيراد…' : 'استيراد Excel'}
        </Button>
        <Button
          variant="secondary"
          icon={<Download size={17} />}
          onClick={handleExport}
          disabled={!filtered.length}
        >
          {query ? 'تصدير النتائج' : 'تصدير Excel'}
        </Button>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsAdding(true)}>
          إضافة مستخدم
        </Button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          tabIndex={-1}
          onChange={handleImport}
          aria-label="اختيار ملف Excel للاستيراد"
        />
      </PageHeader>

      <LedgerStrip total={users.length} latestName={latest?.name} />

      <section className="panel" aria-labelledby="users-panel-title">
        <div className="panel__head">
          <div className="panel__title">
            <h2 id="users-panel-title">قائمة المستخدمين</h2>
            <p>
              {query
                ? `عرض ${filtered.length} من أصل ${users.length} سجل`
                : `${users.length} سجل مسجّل`}
            </p>
          </div>
          <UsersToolbar query={query} onChange={setQuery} />
        </div>
        <UsersTable
          users={filtered}
          query={query}
          onReset={() => setQuery('')}
          onEdit={setPendingEdit}
          onDelete={setPendingDelete}
        />
      </section>

      {isAdding ? <UserFormDialog onClose={() => setIsAdding(false)} /> : null}
      {pendingEdit ? (
        <UserFormDialog user={pendingEdit} onClose={() => setPendingEdit(null)} />
      ) : null}
      {pendingDelete ? (
        <DeleteUserDialog
          user={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
