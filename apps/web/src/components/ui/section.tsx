import type { ReactNode } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  accent = "text-cyan-ink",
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

/** One headline figure for the hero strip: a big number and a short label. */
export type HeroStat = { value: string; label: string };

/** The official source the hero figures can be verified against, as a link under the strip. */
export type HeroSource = { label: string; href: string };

/**
 * The top of every page: breadcrumb, a short eyebrow, the page's question as the title, one line of context, and — when
 * the page has them — a compact row of headline figures. Kept deliberately short so a reader sees what the page is about
 * at a glance, the same way on every page, without a tall block of text before the content.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  stats,
  statsSource,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  /** A short row of headline figures under the intro, so the page's answer is clear without a tall panel. */
  stats?: HeroStat[];
  /** The official NISR page the hero figures can be checked against, shown as a one-click verification link. */
  statsSource?: HeroSource;
  children?: ReactNode;
}) {
  const heading = (
    <>
      <p className="eyebrow flex items-center gap-2.5 text-cyan-ink">
        <BarsMotif />
        {eyebrow}
      </p>
      <h1 className="mt-2.5 text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-6 text-muted sm:text-base sm:leading-7">{intro}</p>
    </>
  );
  const hasStats = Boolean(stats && stats.length > 0);
  return (
    <section className="border-b border-line bg-gradient-to-br from-cyan-soft to-paper">
      <div className="container-page pb-9 pt-5 sm:pb-11 sm:pt-6">
        <Breadcrumbs />
        {hasStats ? (
          // Title on the left half, the three headline figures spread across the right half, so the band fills edge to
          // edge with no empty strip and no tall boxed panel.
          <div className="mt-7 sm:mt-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>{heading}</div>
            <div className="mt-6 border-t border-line pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-1">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 min-[460px]:grid-cols-3">
                {stats!.map((stat, index) => (
                  <div key={`${stat.value}-${index}`}>
                    <dd className="font-display text-[26px] font-bold leading-none tracking-[-0.03em] text-cyan-ink sm:text-[28px]">
                      {stat.value}
                    </dd>
                    <dt className="mt-1.5 text-[12.5px] leading-4 text-ink/75">{stat.label}</dt>
                  </div>
                ))}
              </dl>
              {statsSource && (
                <a
                  href={statsSource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 rounded text-[12.5px] font-semibold text-cyan-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
                >
                  Verify these figures at NISR: {statsSource.label}
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-7 max-w-4xl sm:mt-8">{heading}</div>
        )}
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
      <span className="h-full w-[3px] rounded-full bg-cyan-ink" />
    </span>
  );
}

export function Callout({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "warn" }) {
  const styles = tone === "warn" ? "border-cyan/60 bg-cyan-soft text-ink" : "border-cyan-ink/20 bg-cyan-soft/60 text-ink";
  const body = "text-ink/85";
  return (
    <div className={`rounded-2xl border ${styles} p-5`}>
      <p className="font-display text-sm font-bold">{title}</p>
      <div className={`mt-1.5 text-sm leading-6 ${body}`}>{children}</div>
    </div>
  );
}
