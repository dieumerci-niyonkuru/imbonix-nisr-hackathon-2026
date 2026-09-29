import type { Metadata } from "next";
import { DistrictDirectory } from "@/components/district/district-directory";
import { PlaceFinder } from "@/components/district/place-finder";
import { PageHero } from "@/components/ui/section";
import { DISTRICTS, PROVINCE_LABEL } from "@/lib/data";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: "District profiles",
  description:
    "Profiles of Rwanda's 30 districts across poverty, financial access, nutrition and shocks, with a search for every sector, cell and village.",
};

export default function DistrictsPage() {
  const finderDistricts = DISTRICTS.map((district) => ({
    name: district.name,
    slug: district.slug,
    province: PROVINCE_LABEL[district.province],
  }));
  return (
    <>
      <PageHero
        eyebrow="District profiles"
        title="30 districts, four dimensions each"
        intro="Every district profile shows where it ranks on poverty, financial access, nutrition and shocks, with all the published indicators behind it and a view of its sectors. There is no single score: a district can be doing well on one dimension and badly on another."
      >
        <PlaceFinder
          className="mt-8 max-w-2xl"
          districts={finderDistricts}
          counts={{ sectors: SITE_FACTS.sectors, cells: SITE_FACTS.cells, villages: SITE_FACTS.villages }}
        />
      </PageHero>
      <section className="container-page py-10">
        <DistrictDirectory />
      </section>
    </>
  );
}
