import { StoryBanner, TextCard } from "@/components/home/story-cards";
import { Reveal } from "@/components/ui/reveal";

export type Audience = { title: string; body: string; href: string; linkLabel: string };

/** The groups IMBONIX serves: a full width banner, then one text card for each group with a page to go to. */
export function AudienceSection({ audiences }: { audiences: Audience[] }) {
  return (
    <>
      <StoryBanner
        id="audience-heading"
        eyebrow="Who it serves"
        title="Built for the people who act on the evidence"
        body="Every figure names its source and says how far to trust it, so the same evidence can guide support for a household, a decision in a ministry and the questions civil society asks."
      />
      <div className="bg-paper py-16 sm:py-20">
        <ul className="container-page grid gap-6 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <li key={audience.title}>
              <Reveal delay={index * 0.06} className="h-full">
                <TextCard title={audience.title} body={audience.body} href={audience.href} linkLabel={audience.linkLabel} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
