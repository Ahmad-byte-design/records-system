import { useState, type FormEvent } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/stores/useToastStore';
import { useUserStore } from '../store/useUserStore';
import type { NewUserInput, User } from '../types';
import { validateUserInput, type UserFormErrors } from '../utils/validateUserInput';

type UserFormDialogProps = {
  /** When present the dialog edits this record; otherwise it adds a new one. */
  user?: User;
  onClose: () => void;
};

const EMPTY_FORM: NewUserInput = { name: '', username: '', password: '' };

/** Shared add/edit dialog with the same fields and validation in both modes. */
export function UserFormDialog({ user, onClose }: UserFormDialogProps) {
  const users = useUserStore((state) => state.users);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const isEdit = Boolean(user);
  const titleId = isEdit ? 'edit-user-title' : 'add-user-title';

  const [values, setValues] = useState<NewUserInput>(() =>
    user
      ? { name: user.name, username: user.username, password: user.password }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<UserFormErrors>({});

  const update = (field: keyof NewUserInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateUserInput(values, users, user?.id);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    if (user) {
      const updated = updateUser(user.id, values);
      if (!updated) {
        toast.error('تعذّر تحديث السجل. حاول مرة أخرى.');
        return;
      }
      toast.success(`تم تحديث ${updated.name}`);
    } else {
      const created = addUser(values);
      toast.success(`تمت إضافة ${created.name} إلى السجل`);
    }

    onClose();
  };

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <div className="modal__head">
        <div>
          <p className="eyebrow">{isEdit ? 'تحديث السجل' : 'سجل جديد'}</p>
          <h2 id={titleId}>{isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم'}</h2>
          <p className="modal__intro">
            {isEdit
              ? 'عدّل الاسم أو بيانات الدخول ثم احفظ التعديلات.'
              : 'أدخل الاسم واسم المستخدم وكلمة المرور.'}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق النافذة">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="add-name">
            الاسم الكامل
          </label>
          <input
            id="add-name"
            type="text"
            data-autofocus
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="مثال: أحمد محمد العلي"
            autoComplete="off"
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'add-name-error' : 'add-name-hint'}
          />
          {errors.name ? (
            <span className="field__error" id="add-name-error" role="alert">
              {errors.name}
            </span>
          ) : (
            <span className="field__hint" id="add-name-hint">
              الاسم الأول واسم العائلة على الأقل.
            </span>
          )}
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="add-username">
              اسم المستخدم
            </label>
            <input
              id="add-username"
              type="text"
              value={values.username}
              onChange={(event) => update('username', event.target.value)}
              placeholder="مثال: ahmad.ali"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              maxLength={60}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'add-username-error' : 'add-username-hint'}
            />
            {errors.username ? (
              <span className="field__error" id="add-username-error" role="alert">
                {errors.username}
              </span>
            ) : (
              <span className="field__hint" id="add-username-hint">
                يُستخدم للدخول إلى حساب المستخدم.
              </span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="add-password">
              كلمة المرور
            </label>
            <input
              id="add-password"
              type="text"
              value={values.password}
              onChange={(event) => update('password', event.target.value)}
              placeholder="اكتب كلمة المرور"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              maxLength={80}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'add-password-error' : 'add-password-hint'}
            />
            {errors.password ? (
              <span className="field__error" id="add-password-error" role="alert">
                {errors.password}
              </span>
            ) : (
              <span className="field__hint" id="add-password-hint">
                تظهر كما هي، وتُحفظ على هذا الجهاز فقط.
              </span>
            )}
          </div>
        </div>

        <div className="modal__actions">
          <Button
            type="submit"
            variant="primary"
            icon={isEdit ? <Save size={16} /> : <Plus size={17} />}
          >
            {isEdit ? 'حفظ التعديلات' : 'حفظ المستخدم'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
