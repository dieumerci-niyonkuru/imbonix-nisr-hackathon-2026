import type { Metadata } from "next";
import { ChartCatalogue, type CatalogueSection } from "@/components/data/chart-catalogue";
import { MENU_SECTIONS, NAV } from "@/components/layout/nav";
import { PageHero } from "@/components/ui/section";
import { CHART_INDEX } from "@/lib/chart-index";

export const metadata: Metadata = {
  title: "Chart library",
  description: "Every chart and interactive tool on IMBONIX, grouped by focus area and page, with a filter.",
};

/** The charts of each menu, page by page in menu order; pages without charts are left out. */
function catalogueSections(): CatalogueSection[] {
  const pageLabel = (href: string) => NAV.find((item) => item.href === href)?.label ?? href;
  return MENU_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    intro: section.intro,
    pages: [section.href, ...section.items.map((item) => item.href)]
      .map((href) => ({ href, label: pageLabel(href), charts: CHART_INDEX.filter((chart) => chart.page === href) }))
      .filter((page) => page.charts.length > 0),
  })).filter((section) => section.pages.length > 0);
}

/** Every chart on the site in one list, like a service portal's list of every service. */
export default function AllChartsPage() {
  return (
    <>
      <PageHero
        eyebrow="Data"
        title="Every chart on the site, in one list"
        intro="Grouped by focus area and by page, each with what it shows. Choose a chart to open it at its place on its page, with its source and how to read it."
      />
      <ChartCatalogue sections={catalogueSections()} total={CHART_INDEX.length} />
    </>
  );
}
