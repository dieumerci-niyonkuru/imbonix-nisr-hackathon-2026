import type { Metadata } from "next";
import { ChangeOverTime } from "@/components/over-time/change-over-time";
import { PageHero } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Trends",
  description:
    "How poverty, homes, services, health and work have changed in Rwanda, from the 1978 census to the latest NISR surveys.",
};

/** Poverty dynamics over time: every census since 1978 and every survey round in NISR's Statistical Yearbook. */
export default function ChangeOverTimePage() {
  return (
    <>
      <PageHero
        eyebrow="Poverty dynamics"
        title="How Rwanda has changed, from the first census to the latest surveys"
        intro="Poverty by province, population, homes, services, health and work, round by round. Each chart names its NISR table, and each claim is worked out from the figures in it."
      />
      <ChangeOverTime />
    </>
  );
}
