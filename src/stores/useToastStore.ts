import { create } from 'zustand';

export type ToastTone = 'success' | 'error';

export type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastItem[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
};

const DURATION = 3800;
let sequence = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    sequence += 1;
    const id = sequence;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone }] }));
    window.setTimeout(() => get().dismiss(id), DURATION);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Imperative helpers for use outside React components. */
export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
};
