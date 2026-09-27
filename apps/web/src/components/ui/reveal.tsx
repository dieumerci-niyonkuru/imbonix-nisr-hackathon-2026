import type { CSSProperties, ReactNode } from "react";

/**
 * Fades content up as it scrolls into view, using a CSS scroll-driven animation (see globals.css).
 * Content is always visible without JavaScript and in browsers without scroll timelines; `delay` staggers
 * items that enter together.
 */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={`reveal ${className}`}
      style={delay ? ({ "--reveal-offset": `${Math.round(delay * 100)}%` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
