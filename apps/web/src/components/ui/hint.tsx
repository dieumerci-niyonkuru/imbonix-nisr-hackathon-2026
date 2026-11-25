import type { ReactNode } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

/**
 * A small plain-language explanation that appears on hover or keyboard focus, anchored to a number or term. It is
 * CSS-only, so it works inside a server component, and it is accessible: the trigger is a real focusable button and the
 * panel is a `tooltip`. The panel opens downward, so it never has to escape a section's top edge.
 *
 * Pass `children` to make a word or a number itself the trigger (hover the number to read what it means); pass nothing
 * to get a discreet information icon instead — used where the trigger sits in a clipped card corner.
 */
export function Hint({
  label,
  children,
  align = "center",
}: {
  /** The plain-English meaning shown in the panel. */
  label: string;
  /** The trigger; defaults to an information icon. */
  children?: ReactNode;
  /** Horizontal anchoring of the panel, so it stays on-screen near a card edge. */
  align?: "center" | "start" | "end";
}) {
  const place = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2";
  return (
    <span className="group/hint relative inline-flex">
      <button
        type="button"
        aria-label={`What this means: ${label}`}
        className="inline-flex items-center rounded text-cyan-ink/70 outline-none transition-colors hover:text-cyan-ink focus-visible:text-cyan-ink focus-visible:ring-2 focus-visible:ring-cyan-ink"
      >
        {children ?? <InformationCircleIcon className="h-[18px] w-[18px]" aria-hidden="true" />}
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-30 mt-2 w-64 max-w-[16rem] rounded-xl border border-line bg-white p-3 text-left text-[13px] font-normal leading-5 text-ink opacity-0 shadow-lift transition-opacity duration-150 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100 ${place}`}
      >
        {label}
      </span>
    </span>
  );
}
