"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

/**
 * A "Read more" button that opens the full explanation in a dialog, so a card can stay short. The dialog has a title,
 * an optional line under it, a body that scrolls on small screens and a labelled Close button; Escape and a click
 * outside close it too.
 */
export function ReadMore({
  title,
  subtitle,
  label = "Read more",
  tone = "light",
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  label?: string;
  /** Light for white cards, dark for navy ones. */
  tone?: "light" | "dark";
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        className={cn(
          "group inline-flex items-center gap-1 rounded text-[14px] font-bold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2",
          tone === "light" ? "text-cyan-ink focus-visible:ring-cyan-ink" : "text-white focus-visible:ring-white",
          className,
        )}
      >
        {label}
        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        <span className="sr-only">: {title}</span>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy-950/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-[6vh] z-[60] mx-auto flex max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-line duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-balance font-display text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
                {title}
              </DialogPrimitive.Title>
              {subtitle && <p className="mt-1 text-[14px] leading-6 text-muted">{subtitle}</p>}
            </div>
            <DialogPrimitive.Close className="group inline-flex shrink-0 items-center gap-2 rounded-full py-1 pl-2 pr-1 text-[14px] font-semibold text-ink transition-colors hover:text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink">
              Close
              <span className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-line transition-colors group-hover:bg-navy-900 group-hover:text-white group-hover:ring-navy-900">
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </DialogPrimitive.Close>
          </div>
          {/* Focusable, so a long explanation can be scrolled from the keyboard. */}
          <div
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-[15px] leading-7 text-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-ink"
          >
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** A titled block inside a Read more dialog. */
export function ReadMoreSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2">{children}</div>
    </section>
  );
}
