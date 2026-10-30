import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { digitsOnly } from '@/lib/arabic';
import { toast } from '@/stores/useToastStore';
import { useUserStore } from '../store/useUserStore';
import type { NewUserInput, User } from '../types';

type FormValues = NewUserInput;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = { name: '', phone: '', identity: '' };

const INVALID_PHONE = /[^\d\s+()\-٠-٩۰-۹]/;
const INVALID_IDENTITY = /[^\d\s\-٠-٩۰-۹]/;

function validate(values: FormValues, users: User[]): FormErrors {
  const errors: FormErrors = {};
  const name = values.name.trim();
  const phone = digitsOnly(values.phone);
  const identity = digitsOnly(values.identity);

  if (name.length < 2) {
    errors.name = 'اكتب الاسم الكامل (حرفان على الأقل).';
  }

  if (INVALID_PHONE.test(values.phone)) {
    errors.phone = 'استخدم الأرقام والرموز + - ( ) فقط.';
  } else if (phone.length < 7) {
    errors.phone = 'رقم الهاتف يجب أن يحتوي 7 أرقام على الأقل.';
  } else if (phone.length > 15) {
    errors.phone = 'رقم الهاتف أطول من المسموح.';
  } else if (users.some((user) => digitsOnly(user.phone) === phone)) {
    errors.phone = 'رقم الهاتف مسجّل مسبقاً.';
  }

  if (INVALID_IDENTITY.test(values.identity)) {
    errors.identity = 'رقم الهوية يتكوّن من أرقام فقط.';
  } else if (identity.length < 6) {
    errors.identity = 'رقم الهوية يجب أن يحتوي 6 أرقام على الأقل.';
  } else if (identity.length > 20) {
    errors.identity = 'رقم الهوية أطول من المسموح.';
  } else if (users.some((user) => digitsOnly(user.identity) === identity)) {
    errors.identity = 'رقم الهوية مسجّل مسبقاً.';
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
          <p className="modal__intro">أدخل بيانات المستخدم كما هي في وثيقة الهوية.</p>
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
            <label className="field__label" htmlFor="add-phone">
              رقم الهاتف
            </label>
            <input
              id="add-phone"
              value={values.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="0938 938 300"
              inputMode="tel"
              dir="ltr"
              autoComplete="off"
              maxLength={24}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'add-phone-error' : 'add-phone-hint'}
            />
            {errors.phone ? (
              <span className="field__error" id="add-phone-error" role="alert">
                {errors.phone}
              </span>
            ) : (
              <span className="field__hint" id="add-phone-hint">
                يقبل الأرقام العربية والإنجليزية.
              </span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="add-identity">
              رقم الهوية
            </label>
            <input
              id="add-identity"
              value={values.identity}
              onChange={(event) => update('identity', event.target.value)}
              placeholder="012931092"
              inputMode="numeric"
              dir="ltr"
              autoComplete="off"
              maxLength={24}
              aria-invalid={Boolean(errors.identity)}
              aria-describedby={errors.identity ? 'add-identity-error' : 'add-identity-hint'}
            />
            {errors.identity ? (
              <span className="field__error" id="add-identity-error" role="alert">
                {errors.identity}
              </span>
            ) : (
              <span className="field__hint" id="add-identity-hint">
                الرقم كما هو في الهوية.
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
