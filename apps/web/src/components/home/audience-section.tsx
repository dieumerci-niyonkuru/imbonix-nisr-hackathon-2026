import { StoryBanner, TextCard } from "@/components/home/story-cards";

export type Audience = { title: string; body: string; href: string; linkLabel: string };

/**
 * Who benefits: a full width banner, then one text card for each group with the page that serves it best. The
 * groups sit three across on wide screens.
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
      <div className="bg-paper py-10 sm:py-12">
        <ul className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <li key={audience.title}>
              <div className="h-full">
                <TextCard title={audience.title} body={audience.body} href={audience.href} linkLabel={audience.linkLabel} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
