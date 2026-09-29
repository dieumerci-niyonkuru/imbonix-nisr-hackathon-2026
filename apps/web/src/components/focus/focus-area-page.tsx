import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ExclusionFocus } from "@/components/focus/exclusion-focus";
import { PovertyFocus } from "@/components/focus/poverty-focus";
import { ProtectionFocus } from "@/components/focus/protection-focus";
import { TextCard } from "@/components/home/story-cards";
import { FOCUS_AREAS, NAV_GROUPS, type FocusAreaId } from "@/components/layout/nav";
import { PageHero, SectionHeader } from "@/components/ui/section";

/** The question each focus area answers, in plain words. */
const QUESTIONS: Record<FocusAreaId, string> = {
  exclusion: "Who is left out of finance, and who is included but not resilient?",
  poverty: "Who is poor, where, and what has changed?",
  protection: "Who does social protection reach, and how well?",
};

/** A page name inside a sentence: first letter lower case, unless it starts with a proper noun or an acronym. */
const lowerFirst = (label: string) =>
  /^(Rwanda\b|[A-Z]{2})/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);

/** The page title and description for a focus area at a glance. */
export function focusAreaMetadata(areaId: FocusAreaId): Metadata {
  const area = FOCUS_AREAS.find((item) => item.id === areaId)!;
  // An absolute title, so the section layout does not add the section name a second time.
  return { title: { absolute: `${area.label} at a glance | IMBONIX` }, description: QUESTIONS[area.id] };
}

/**
 * One focus area at a glance, told as a story in sections with its own menu under the header: the key figures, the
 * evidence behind them, then the pages that go deeper and the other two focus areas.
 */
export function FocusAreaPage({ areaId }: { areaId: FocusAreaId }) {
  const area = FOCUS_AREAS.find((item) => item.id === areaId)!;
  const group = NAV_GROUPS.find((item) => item.focusId === area.id)!;
  const otherAreas = FOCUS_AREAS.filter((item) => item.id !== area.id);

  return (
    <>
      <PageHero
        eyebrow={`${area.label} at a glance`}
        title={QUESTIONS[area.id]}
        intro={`${group.intro} Every chart below says what it shows, where the figures come from and how far to trust them.`}
      />

      {area.id === "exclusion" && <ExclusionFocus />}
      {area.id === "poverty" && <PovertyFocus />}
      {area.id === "protection" && <ProtectionFocus />}

      <section id="deeper" className="scroll-mt-36 border-t border-line bg-white py-16 sm:py-20" aria-labelledby="deeper-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Go deeper"
            title={<span id="deeper-heading">More on {area.label.toLowerCase()}</span>}
            intro="Each page takes one question further, district by district, with its sources."
          />
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {group.items.map((item) => (
              <li key={item.href}>
                <TextCard
                  title={item.label}
                  body={item.description}
                  href={item.href}
                  linkLabel={`Go to ${lowerFirst(item.label)}`}
                  tone="paper"
                />
              </li>
            ))}
          </ul>

          <nav
            aria-label="Other focus areas"
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6"
          >
            <span className="text-[13.5px] font-bold text-muted">Other focus areas</span>
            {otherAreas.map((other) => (
              <Link
                key={other.id}
                href={other.href}
                className="group inline-flex items-center gap-1.5 rounded text-[15px] font-bold text-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-ink"
              >
                {other.label} at a glance
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </>
  );
}
