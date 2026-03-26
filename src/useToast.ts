import { useCallback, useEffect, useRef, useState } from "react";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

const AUTO_DISMISS_MS = 5_000;

/**
 * Lightweight toast hook for inline success/error messages.
 *
 * Usage:
 *   const { toast, showSuccess, showError, clearToast } = useToast();
 *   // Render:
 *   {toast && <p role="alert" aria-live="polite" className={`adminPanel__${toast.type}`}>{toast.message}</p>}
 */
export function useToast(autoDismissMs = AUTO_DISMISS_MS) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    setToast(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (message: string, type: ToastType) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type });
      if (autoDismissMs > 0) {
        timerRef.current = setTimeout(() => {
          setToast(null);
          timerRef.current = null;
        }, autoDismissMs);
      }
    },
    [autoDismissMs],
  );

  const showSuccess = useCallback((msg: string) => show(msg, "success"), [show]);
  const showError = useCallback((msg: string) => show(msg, "error"), [show]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, showSuccess, showError, clearToast } as const;
}
