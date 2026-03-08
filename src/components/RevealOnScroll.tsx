import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./RevealOnScroll.scss";

type RevealOnScrollProps = {
  children: ReactNode;
  className: string;
  triggerBottomPercent?: number;
};

export default function RevealOnScroll({
  children,
  className,
  triggerBottomPercent = 35,
}: RevealOnScrollProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) return;
    const clampedTriggerPercent = Math.max(0, Math.min(95, triggerBottomPercent));

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold: 0.01,
        rootMargin: `0px 0px -${clampedTriggerPercent}% 0px`,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, triggerBottomPercent]);

  return (
    <div
      ref={containerRef}
      className={`${className} revealOnScroll ${isVisible ? "revealOnScroll--visible" : ""}`}
    >
      {children}
    </div>
  );
}
