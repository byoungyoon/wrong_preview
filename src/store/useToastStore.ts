import { create } from 'zustand';

interface ToastState {
  toastMessage: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toastMessage: null,
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
}));
