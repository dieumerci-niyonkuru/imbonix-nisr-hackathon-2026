import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export type FocusStat = { value: string; label: string; color: string };
export type FocusLink = { href: string; label: string };

/** One homepage tab: the claim and its key numbers on the left, the charts that back it on the right. */
export function FocusPanel({
  kicker,
  title,
  body,
  stats = [],
  links = [],
  children,
}: {
  kicker?: string;
  title: string;
  body: string;
  stats?: FocusStat[];
  links?: FocusLink[];
  children: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      <div>
        {kicker && <p className="eyebrow mb-3 text-royal">{kicker}</p>}
        <h2 className="text-balance font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-pretty text-[15px] leading-7 text-muted sm:text-base">{body}</p>

        {stats.length > 0 && (
          <dl className="mt-8 grid gap-5">
            {/* Each group holds only its dt and dd, as a description list requires; the colour bar is drawn in CSS. */}
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative flex flex-col pl-5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-[var(--stat-color)]"
                style={{ "--stat-color": stat.color } as CSSProperties}
              >
                <dt className="order-2 text-[14px] leading-5 text-muted">{stat.label}</dt>
                <dd className="order-1 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="group inline-flex items-center gap-1.5 text-[14.5px] font-bold text-royal">
                  {link.label}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid content-start gap-6">{children}</div>
    </div>
  );
}
