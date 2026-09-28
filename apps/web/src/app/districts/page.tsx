import type { Metadata } from "next";
import { DistrictDirectory } from "@/components/district/district-directory";
import { PageHero } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Find your district",
  description: "Profiles of Rwanda's 30 districts across poverty, financial access, nutrition and shocks.",
};

export default function DistrictsPage() {
  return (
    <>
      <PageHero
        eyebrow="Find your district"
        title="30 districts, four dimensions each"
        intro="Every district profile shows where it ranks on poverty, financial access, nutrition and shocks, with all the published indicators behind it and a view of its sectors. There is no single score: a district can be doing well on one dimension and badly on another."
      />
      <section className="container-page py-10">
        <DistrictDirectory />
      </section>
    </>
  );
}
