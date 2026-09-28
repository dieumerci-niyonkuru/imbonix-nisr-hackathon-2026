"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

/**
 * A labelled dropdown: the label above, a white field with a clear arrow, and strong hover and focus states. It is a
 * native select, so it works with the keyboard, screen readers and phone pickers as people expect.
 */
export function SelectField({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[13px] font-bold text-muted">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none truncate rounded-xl border border-line bg-white pl-3.5 pr-10 text-[14.5px] font-semibold text-ink shadow-card transition-colors hover:border-cyan-ink/60 focus:border-cyan-ink focus:outline-none focus:ring-2 focus:ring-cyan/50"
        >
          {children}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-ink"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
