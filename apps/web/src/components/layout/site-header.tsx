import { SiteHeaderNav, type HeaderData } from "@/components/layout/site-header-nav";
import { DISTRICTS, PROVINCE_LABEL, SOURCES } from "@/lib/data";
import { CHART_INDEX } from "@/lib/chart-index";
import { DIMENSIONS, INDICATORS } from "@/lib/indicators";
import { POVERTY_RATE_BY_YEAR } from "@/lib/eicv7-poverty-profile";
import { FINANCIAL_HEALTH_SEGMENTS, INCLUSION_BY_ROUND } from "@/lib/finscope-2024";
import { LEVERS } from "@/lib/priorities";
import { timeliness } from "@/lib/surveys";
import { SITE_FACTS } from "@/lib/site-facts";

/**
 * The site header. The coverage figures, the key figure in each menu and the search lists (districts, indicators,
 * charts and policy levers) are worked out here on the server, so the browser only receives what it needs.
 */
export function SiteHeader() {
  const healthyShare = FINANCIAL_HEALTH_SEGMENTS.find((segment) => segment.segment === "Financially healthy")!.share;
  const includedShare = INCLUSION_BY_ROUND.find((row) => row.measure === "Financially included")!.in2024;
  const [povertyBefore, povertyNow] = POVERTY_RATE_BY_YEAR;
  const directSupportOnTime = Math.round((timeliness("Direct Support")[0]?.all ?? 0) * 10) / 10;

  const data: HeaderData = {
    // One key figure per focus area, shown in its dropdown.
    menuFigures: {
      exclusion: {
        value: `${healthyShare}%`,
        label: `of adults are financially healthy, though ${includedShare}% use a financial service`,
        source: "NISR, FinScope 2024",
      },
      poverty: {
        value: `${povertyNow.povertyRate}%`,
        label: `of people live in poverty, down from ${povertyBefore.povertyRate}% in ${povertyBefore.year}`,
        source: "NISR, EICV7 2023/24",
      },
      protection: {
        value: `${directSupportOnTime}%`,
        label: "of Direct Support households were paid on time the last time",
        source: "NISR, EICV7 VUP thematic report 2023/24",
      },
    },
    coverage: [
      { value: SITE_FACTS.districts, label: "districts" },
      { value: SITE_FACTS.sectors, label: "sectors" },
      { value: SITE_FACTS.indicators, label: "indicators" },
      { value: SITE_FACTS.publications, label: "publications" },
    ],
    search: {
      districts: DISTRICTS.map((district) => ({
        name: district.name,
        slug: district.slug,
        province: PROVINCE_LABEL[district.province] ?? district.province,
      })),
      // Every indicator: those on the map open it there, the others open their row in the catalogue.
      measures: INDICATORS.filter((indicator) => SOURCES[indicator.id]).map((indicator) => {
        const dimension = DIMENSIONS[indicator.dimension];
        const source = SOURCES[indicator.id];
        return {
          id: indicator.id,
          label: indicator.short,
          hint: `${dimension.label} · ${source.source}, ${source.year}${indicator.layer ? " · on the map" : ""}`,
          terms: `${source.label} ${source.source} ${dimension.label} indicator`,
          href: indicator.layer ? `/map?layer=${indicator.id}` : `/data#indicator-${indicator.id}`,
        };
      }),
      charts: CHART_INDEX,
      levers: LEVERS.map((lever) => ({ title: lever.title, question: lever.question })),
    },
  };

  return <SiteHeaderNav data={data} />;
}
