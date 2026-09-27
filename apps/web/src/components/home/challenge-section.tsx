import { MapCard } from "@/components/home/story-cards";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section";
import { DISTRICTS, SOURCES, valueOf } from "@/lib/data";
import { meta } from "@/lib/indicators";
import { RAMPS } from "@/lib/palette";

export type ChallengePart = {
  area: string;
  /** The finding, with its figure, as the card title. */
  title: string;
  source: string;
  /** The district measure drawn as the card's picture. */
  indicatorId: string;
  ramp: "cyan" | "blue" | "navy";
  href: string;
  linkLabel: string;
};

/**
 * District fills for a map on navy: five classes by rank, from the ramp's darkest step to its lightest, so the
 * districts with the highest values stand out. Districts without a value take the darkest step.
 */
function fillsOnNavy(indicatorId: string, ramp: readonly string[]): Record<string, string> {
  const steps = [...ramp].reverse();
  const ranked = DISTRICTS.map((district) => ({ slug: district.slug, value: valueOf(district, indicatorId) }))
    .filter((row): row is { slug: string; value: number } => row.value !== undefined)
    .sort((first, second) => first.value - second.value);
  const fills: Record<string, string> = Object.fromEntries(DISTRICTS.map((district) => [district.slug, steps[0]]));
  ranked.forEach((row, index) => {
    fills[row.slug] = steps[Math.min(steps.length - 1, Math.floor((index * steps.length) / ranked.length))];
  });
  return fills;
}

/**
 * The problem in three parts (financial exclusion, poverty dynamics, social protection impact), each an image card
 * whose picture is a district map of a related measure, with the finding as its title and a link to read more.
 */
export function ChallengeSection({ parts }: { parts: ChallengePart[] }) {
  return (
    <section className="bg-paper py-16 sm:py-20" aria-labelledby="challenge-heading">
      <div className="container-page">
        <SectionHeader
          eyebrow="The problem we address"
          title={<span id="challenge-heading">Understand exclusion, poverty and social protection, then act</span>}
          intro="Reducing poverty in Rwanda means knowing who is left out of finance, how poverty is changing and how well social protection programmes reach the people they are meant for. IMBONIX answers each question with NISR data, in a form vulnerable households, policymakers and civil society can use."
        />

        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {parts.map((part, index) => {
            const caption = `Map: ${meta(part.indicatorId).short.toLowerCase()} by district, ${SOURCES[part.indicatorId].year}. Brighter is higher.`;
            return (
              <li key={part.area}>
                <Reveal delay={index * 0.06} className="h-full">
                  <MapCard
                    area={part.area}
                    title={part.title}
                    source={part.source}
                    caption={caption}
                    fills={fillsOnNavy(part.indicatorId, RAMPS[part.ramp])}
                    href={part.href}
                    linkLabel={part.linkLabel}
                  />
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
