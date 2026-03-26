import { useEffect } from "react";

/**
 * Calls `onEscape` when the Escape key is pressed.
 * Pass `enabled = false` to disable (e.g. while submitting).
 */
export function useEscapeKey(onEscape: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape, enabled]);
}
