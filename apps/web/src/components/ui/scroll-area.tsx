import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A horizontally scrolling box for wide tables. It is a labelled region that can take keyboard focus, so people who
 * do not use a mouse can scroll it with the arrow keys on narrow screens.
 */
export function ScrollArea({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "scrollbar-thin overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
