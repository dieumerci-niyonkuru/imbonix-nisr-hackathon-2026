import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  accent = "text-royal",
  align = "left",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  accent?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className={`eyebrow ${accent}`}>{eyebrow}</p>}
      <h2
        className={`mt-3 text-balance font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-pretty text-[15px] leading-7 sm:text-base ${dark ? "text-white/70" : "text-muted"}`}>{intro}</p>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <HeroRings />
      <div className="container-page relative pb-14 pt-6 sm:pb-16 sm:pt-8">
        <Breadcrumbs />
        <p className="eyebrow mt-10 flex items-center gap-2.5 text-royal sm:mt-12">
          <BarsMotif />
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl text-balance font-display text-4xl font-bold tracking-[-0.035em] text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted sm:text-lg sm:leading-8">{intro}</p>
        {children}
      </div>
    </section>
  );
}

/** Three rising bars, from the small chart under the logo's tagline. */
export function BarsMotif({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-3 items-end gap-[2px] ${className}`} aria-hidden="true">
      <span className="h-[45%] w-[3px] rounded-full bg-cyan" />
      <span className="h-[72%] w-[3px] rounded-full bg-cyan" />
      <span className="h-full w-[3px] rounded-full bg-royal" />
    </span>
  );
}

/** Thin concentric arcs after the logo's open ring: a quiet, crisp mark in the corner of a hero. */
export function HeroRings({ className = "-right-32 -top-40 text-brand-100" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute hidden h-[560px] w-[560px] md:block ${className}`}
      viewBox="0 0 560 560"
      fill="none"
      aria-hidden="true"
    >
      <path d="M 60 360 A 220 220 0 1 1 420 110" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 452 150 A 220 220 0 0 1 494 230" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="280" cy="280" r="150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      <circle cx="420" cy="110" r="7" className="fill-cyan" />
    </svg>
  );
}

export function Callout({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "warn" }) {
  const styles = tone === "warn" ? "border-cyan/60 bg-cyan-soft text-ink" : "border-royal/20 bg-brand-50/60 text-ink";
  const body = "text-ink/85";
  return (
    <div className={`rounded-2xl border ${styles} p-5`}>
      <p className="font-display text-sm font-bold">{title}</p>
      <div className={`mt-1.5 text-sm leading-6 ${body}`}>{children}</div>
    </div>
  );
}
