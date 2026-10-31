import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { User } from '../types';

type DeleteUserDialogProps = {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Confirmation popup shown before a record is removed from the registry. */
export function DeleteUserDialog({ user, onCancel, onConfirm }: DeleteUserDialogProps) {
  return (
    <Modal titleId="delete-user-title" onClose={onCancel}>
      <div className="modal__head">
        <div>
          <p className="eyebrow">تأكيد الحذف</p>
          <h2 id="delete-user-title">حذف المستخدم</h2>
          <p className="modal__intro">
            سيُحذف هذا السجل نهائياً من هذا الجهاز، ولا يمكن التراجع عن الحذف.
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="إغلاق النافذة">
          <X size={18} />
        </button>
      </div>

      <div className="delete-summary">
        <span className="delete-summary__icon" aria-hidden="true">
          <AlertTriangle size={18} />
        </span>
        <div className="delete-summary__text">
          <span className="delete-summary__name">{user.name}</span>
          <span className="delete-summary__meta">
            <span dir="ltr">{user.username || '—'}</span>
            <span aria-hidden="true">·</span>
            <span>سجل #{String(user.id).padStart(2, '0')}</span>
          </span>
        </div>
      </div>

      <div className="modal__actions">
        <Button variant="danger" icon={<Trash2 size={16} />} onClick={onConfirm}>
          حذف نهائي
        </Button>
        <Button variant="ghost" onClick={onCancel} data-autofocus>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
