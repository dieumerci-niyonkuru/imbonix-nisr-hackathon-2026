import { StoryBanner, TextCard } from "@/components/home/story-cards";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type Audience = { title: string; body: string; href: string; linkLabel: string };

/**
 * Who benefits: a full width banner, then one text card for each group with the page that serves it best. Five
 * groups sit three over two on wide screens.
 */
export function AudienceSection({ audiences }: { audiences: Audience[] }) {
  return (
    <>
      <StoryBanner
        id="audience-heading"
        eyebrow="Impact"
        title="Who benefits"
        body="Every figure names its source and says how far to trust it, so the same evidence can guide support for a household, a decision in a ministry, a study and the questions civil society asks."
      />
      <div className="bg-paper py-16 sm:py-20">
        <ul className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {audiences.map((audience, index) => (
            <li key={audience.title} className={cn(index < 3 ? "lg:col-span-2" : "lg:col-span-3")}>
              <Reveal delay={index * 0.05} className="h-full">
                <TextCard title={audience.title} body={audience.body} href={audience.href} linkLabel={audience.linkLabel} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
