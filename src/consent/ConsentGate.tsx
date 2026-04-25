import type { ReactNode } from "react";
import { useCookieConsent, type ConsentCategory } from "./useCookieConsent";

interface ConsentGateProps {
  category: Exclude<ConsentCategory, "necessary">;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConsentGate({ category, children, fallback = null }: ConsentGateProps) {
  const { allows } = useCookieConsent();
  if (!allows(category)) return <>{fallback}</>;
  return <>{children}</>;
}
