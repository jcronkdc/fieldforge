import React from "react";
import { useSyncExternalStore } from "react";
import { CheckCircle, Info, X, XCircle } from "lucide-react";

export type ToastKind = "success" | "error" | "info";

type Toast = {
  id: string;
  kind: ToastKind;
  text: string;
  timeout?: number;
};

const listeners = new Set<() => void>();
let toasts: Toast[] = [];

export const toastStore = {
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot() {
    return toasts;
  },
  push(toast: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2);
    const entry: Toast = { id, timeout: 4000, ...toast };
    toasts = [...toasts, entry];
    listeners.forEach((listener) => listener());

    if (entry.timeout) {
      window.setTimeout(() => {
        toasts = toasts.filter((item) => item.id !== id);
        listeners.forEach((listener) => listener());
      }, entry.timeout);
    }

    return id;
  },
  dismiss(id: string) {
    toasts = toasts.filter((item) => item.id !== id);
    listeners.forEach((listener) => listener());
  },
};

export function useToasts() {
  return useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);
}

const ICONS: Record<ToastKind, JSX.Element> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  error: <XCircle className="h-5 w-5 text-rose-400" />,
  info: <Info className="h-5 w-5 text-cyan-400" />,
};

const KIND_STYLES: Record<ToastKind, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-rose-500/30 bg-rose-500/10",
  info: "border-cyan-500/30 bg-cyan-500/10",
};

export function Toaster() {
  const items = useToasts();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-[2000] flex w-full max-w-sm flex-col gap-2 md:max-w-md"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg backdrop-blur bg-surface/90 ${KIND_STYLES[toast.kind]}`}
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true">{ICONS[toast.kind]}</span>
            <p className="flex-1 text-sm on-surface">{toast.text}</p>
            <button
              type="button"
              className="btn btn-ghost px-2 py-1 text-sm text-slate-300 hover:text-white"
              onClick={() => toastStore.dismiss(toast.id)}
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export const FuturisticToastContainer = Toaster;

export const toast = {
  success(text: string) {
    return toastStore.push({ kind: "success", text });
  },
  error(text: string) {
    return toastStore.push({ kind: "error", text });
  },
  info(text: string) {
    return toastStore.push({ kind: "info", text });
  },
  loading(text: string) {
    return toastStore.push({ kind: "info", text, timeout: undefined });
  },
  dismiss(id: string) {
    toastStore.dismiss(id);
  },
};

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showInfo = (message: string) => toast.info(message);
export const showLoading = (message: string) => toast.loading(message);
