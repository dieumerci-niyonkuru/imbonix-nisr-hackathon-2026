import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { buildFocusPanels } from "@/components/focus/focus-panels";
import { PovertyMapSection } from "@/components/home/poverty-map-section";
import { TextCard } from "@/components/home/story-cards";
import { FOCUS_AREAS, NAV_GROUPS, type FocusAreaId } from "@/components/layout/nav";
import { PageHero, SectionHeader } from "@/components/ui/section";

type Params = { params: Promise<{ area: string }> };

/** The question each focus area answers, in plain words. */
const QUESTIONS: Record<FocusAreaId, string> = {
  exclusion: "Who is left out of finance, and who is included but not resilient?",
  poverty: "Who is poor, where, and what has changed?",
  protection: "Who does social protection reach, and how well?",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return FOCUS_AREAS.map((area) => ({ area: area.id }));
}

function focusArea(id: string) {
  return FOCUS_AREAS.find((area) => area.id === id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const area = focusArea((await params).area);
  return area ? { title: `${area.label} at a glance`, description: QUESTIONS[area.id] } : {};
}

/**
 * One focus area at a glance: the question, the claim with its key numbers and the charts behind it, then the pages
 * that go deeper and the other two focus areas.
 */
export default async function FocusAreaPage({ params }: Params) {
  const area = focusArea((await params).area);
  if (!area) notFound();
  const group = NAV_GROUPS.find((item) => item.focusId === area.id)!;
  const panel = buildFocusPanels()[area.id];
  const otherAreas = FOCUS_AREAS.filter((item) => item.id !== area.id);

  return (
    <>
      <PageHero
        eyebrow={`${area.label} at a glance`}
        title={QUESTIONS[area.id]}
        intro={`${group.intro} Every chart below says what it shows, where the figures come from and how far to trust them.`}
      />

      <section className="bg-paper py-12 sm:py-16" aria-label={`${area.label}: the evidence`}>
        <div className="container-page">{panel}</div>
      </section>

      {area.id === "poverty" && <PovertyMapSection />}

      <section className="bg-white py-16 sm:py-20" aria-labelledby="deeper-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Go deeper"
            title={<span id="deeper-heading">More on {area.label.toLowerCase()}</span>}
            intro="Each page takes one question further, district by district, with its sources."
          />
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {group.items.map((item) => (
              <li key={item.href}>
                <TextCard title={item.label} body={item.description} href={item.href} linkLabel="Open the page" tone="paper" />
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
                href={`/focus/${other.id}`}
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
