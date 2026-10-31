import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { normalizeArabic } from '@/lib/arabic';
import { toast } from '@/stores/useToastStore';
import { useUserStore } from '../store/useUserStore';
import type { NewUserInput, User } from '../types';

type FormValues = NewUserInput;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = { name: '', username: '', password: '' };

function validate(values: FormValues, users: User[]): FormErrors {
  const errors: FormErrors = {};
  const name = values.name.trim();
  const username = values.username.trim();
  const password = values.password.trim();

  if (name.length < 2) {
    errors.name = 'اكتب الاسم الكامل (حرفان على الأقل).';
  }

  if (username.length < 2) {
    errors.username = 'اكتب اسم المستخدم (حرفان على الأقل).';
  } else if (users.some((user) => normalizeArabic(user.username) === normalizeArabic(username))) {
    errors.username = 'اسم المستخدم مسجّل مسبقاً.';
  }

  if (!password) {
    errors.password = 'اكتب كلمة المرور.';
  }

  return errors;
}

export function AddUserDialog({ onClose }: { onClose: () => void }) {
  const users = useUserStore((state) => state.users);
  const addUser = useUserStore((state) => state.addUser);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values, users);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    const user = addUser(values);
    toast.success(`تمت إضافة ${user.name} إلى السجل`);
    onClose();
  };

  return (
    <Modal titleId="add-user-title" onClose={onClose}>
      <div className="modal__head">
        <div>
          <p className="eyebrow">سجل جديد</p>
          <h2 id="add-user-title">إضافة مستخدم</h2>
          <p className="modal__intro">أدخل الاسم واسم المستخدم وكلمة المرور.</p>
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
          <Button type="submit" variant="primary" icon={<Plus size={17} />}>
            حفظ المستخدم
          </Button>
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
