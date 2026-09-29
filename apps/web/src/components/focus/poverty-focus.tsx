import { ComparisonBars, type ComparisonSeries } from "@/components/charts/recharts/comparison-bars";
import { PovertyTrendChart } from "@/components/charts/recharts/poverty-charts";
import { ValueBars } from "@/components/charts/recharts/value-bars";
import { ShareBars } from "@/components/charts/share-bars";
import { MEN, WOMEN } from "@/components/charts/dumbbell";
import { Finding } from "@/components/focus/finding";
import { oneDecimal } from "@/components/focus/focus-shared";
import { FigureTiles, type FigureTile } from "@/components/home/figure-tiles";
import { PovertyMapSection } from "@/components/home/poverty-map-section";
import { ChartCard } from "@/components/ui/chart-card";
import { SectionHeader } from "@/components/ui/section";
import { SectionNav, type PageSection } from "@/components/ui/section-nav";
import { DISTRICTS, PROVINCE_LABEL, PROVINCES, reference, valueOf, weightedRate } from "@/lib/data";
import {
  COOKING_FUELS,
  EICV7_PROFILE_SOURCE,
  ELECTRICITY_SOURCES,
  LITERACY_BY_QUINTILE,
  LIVING_STANDARDS_BY_YEAR,
  SETTLEMENT_TYPES,
} from "@/lib/eicv7-poverty-profile";
import { POVERTY_TREND } from "@/lib/national";
import { COMPARE, CORE, DEEP_CYAN, LIGHT_GREY, MID_GREY } from "@/lib/palette";
import { PEOPLE_OUT_OF_POVERTY_MILLIONS, PEOPLE_OUT_OF_POVERTY_PER_YEAR } from "@/lib/poverty-social-protection";
import { usagePairs, usageRows } from "@/lib/surveys";

const EICV7_SOURCE = "NISR, EICV7 2023/24";
const DHS_SOURCE = "NISR, Rwanda DHS 2025, Tables 15.5.1 and 15.5.2";
const PROVINCE_SOURCE = "IMBONIX calculation from the NISR EICV7 2023/24 and FinScope 2024 district tables";

/** Deep cyan and cyan: the two measures sit side by side, so they need colours that cannot be confused. */
const PROVINCE_SERIES: ComparisonSeries = [
  { key: "povertyRate", label: "Poverty rate", color: DEEP_CYAN },
  { key: "notFormallyIncluded", label: "Not formally included", color: CORE.cyan },
];

const SEX_SERIES: ComparisonSeries = [
  { key: "women", label: "Women", color: WOMEN },
  { key: "men", label: "Men", color: MEN },
];

/** The two EICV rounds, as their survey periods. */
const SURVEY_ROUND_SERIES: ComparisonSeries = [
  { key: "in2017", label: "2016/17", color: COMPARE.before },
  { key: "in2024", label: "2023/24", color: COMPARE.after },
];

/** DHS wealth fifths, poorest first, with the two ends named so they read without a legend. */
const WEALTH_LABEL: Record<string, string> = {
  Lowest: "Poorest",
  Second: "Second",
  Middle: "Middle",
  Fourth: "Fourth",
  Highest: "Richest",
};

const ELECTRICITY_COLORS: Record<string, string> = {
  "National grid": DEEP_CYAN,
  Solar: CORE.cyan,
  "No electricity": LIGHT_GREY,
};

/** Wood and straw in deep cyan, cleaner fuels in cyan. */
const COOKING_FUEL_COLORS: Record<string, string> = {
  Firewood: DEEP_CYAN,
  "Straw or sticks": DEEP_CYAN,
  Charcoal: CORE.cyan,
  "Gas and other": CORE.cyan,
};

const SETTLEMENT_COLORS = [DEEP_CYAN, LIGHT_GREY, CORE.cyan, MID_GREY];

const SECTIONS: PageSection[] = [
  { id: "key-figures", label: "Key figures" },
  { id: "change", label: "What changed" },
  { id: "where", label: "Where" },
  { id: "who", label: "Who is poorest" },
  { id: "living", label: "How households live" },
  { id: "deeper", label: "Go deeper" },
];

/**
 * Poverty dynamics at a glance, as one story in sections with a menu under the header: the key figures, what changed
 * between the two EICV rounds, where poverty is deepest, who is poorest and how households live. Every figure is
 * worked out from the data or a named NISR table, so the headings stay true if the figures change.
 */
export function PovertyFocus() {
  const [before, now] = POVERTY_TREND;
  const povertyDrop = oneDecimal(before.poverty - now.poverty);
  const extremeHalved = now.extreme <= before.extreme / 2;

  const poverty = (district: (typeof DISTRICTS)[number]) => valueOf(district, "eicv7_poverty_rate");
  const ranked = DISTRICTS.filter((district) => poverty(district) !== undefined).sort(
    (first, second) => poverty(second)! - poverty(first)!,
  );
  const poorest = ranked[0];
  const leastPoor = ranked[ranked.length - 1];

  // Province rates weighted from the 30 district rates: poverty by people, finance by adults.
  const povertyIn = (province?: string) => oneDecimal(weightedRate("eicv7_poverty_rate", "census_population", province)!);
  const notFormallyIncludedIn = (province?: string) =>
    oneDecimal(weightedRate("finscope_not_formally_included", "proj_adults_16plus_2024", province)!);
  const provinceRows = PROVINCES.map((province) => ({
    // Short names, so the five labels fit beside the bars on a phone.
    province: PROVINCE_LABEL[province].replace(" Province", "").replace("City of ", ""),
    povertyRate: povertyIn(province),
    notFormallyIncluded: notFormallyIncludedIn(province),
  }));
  const poorestProvince = [...provinceRows].sort((first, second) => second.povertyRate - first.povertyRate)[0];

  const womenByWealth = usageRows("Wealth quintile", "women");
  const poorestWomen = womenByWealth.find((row) => row.category === "Lowest")!;
  const richestWomen = womenByWealth.find((row) => row.category === "Highest")!;
  const useByWealth = usagePairs("Wealth quintile", "either").map((row) => ({
    wealth: WEALTH_LABEL[row.label],
    women: row.women,
    men: row.men!,
  }));
  const [poorestLiteracy, richestLiteracy] = LITERACY_BY_QUINTILE;

  const householdsWithElectricity = ELECTRICITY_SOURCES.filter((row) => row.source !== "No electricity").reduce(
    (sum, row) => sum + row.share,
    0,
  );
  const woodOrStraw = COOKING_FUELS.filter((row) => row.fuel === "Firewood" || row.fuel === "Straw or sticks").reduce(
    (sum, row) => sum + row.share,
    0,
  );
  const plannedVillageShare = SETTLEMENT_TYPES[0].share;

  const tiles: FigureTile[] = [
    {
      value: `${now.poverty}%`,
      label: `of people live in poverty in ${now.period}, down from ${before.poverty}% in ${before.period}`,
      source: `${EICV7_SOURCE} (${now.note})`,
    },
    {
      value: `${now.extreme}%`,
      label: `live in extreme poverty, down from ${before.extreme}% in ${before.period}`,
      source: EICV7_SOURCE,
    },
    {
      value: `${PEOPLE_OUT_OF_POVERTY_MILLIONS} million`,
      label: `people left poverty between the two surveys, around ${PEOPLE_OUT_OF_POVERTY_PER_YEAR.toLocaleString("en-US")} a year`,
      source: EICV7_SOURCE,
    },
    {
      value: `${oneDecimal(poverty(poorest)!)}%`,
      label: `are poor in ${poorest.name}, the poorest district, against ${oneDecimal(poverty(leastPoor)!)}% in ${leastPoor.name}`,
      source: "NISR, EICV7 Main Indicators Report 2023/24",
    },
  ];

  return (
    <>
      <SectionNav label="Poverty dynamics" sections={SECTIONS} />

      <div id="key-figures" className="scroll-mt-36">
        <FigureTiles
          id="key-figures-heading"
          eyebrow="Key figures"
          title="Poverty has fallen, but it is still deep in the South and West"
          intro={`Rwanda's poverty rate fell ${povertyDrop} points between the ${before.period} and ${now.period} household surveys. The gains are real, yet poverty is still far higher in the Southern and Western provinces than in Kigali.`}
          tiles={tiles}
          columns={4}
        />
      </div>

      <section id="change" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-labelledby="change-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="What changed"
            title={<span id="change-heading">Fewer people are poor, and daily life has improved</span>}
            intro={`Between ${before.period} and ${now.period}, poverty fell from ${before.poverty}% to ${now.poverty}%${extremeHalved ? " and extreme poverty more than halved" : ""}. Roofs, roads, water and planned settlement all improved.`}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ChartCard
              id="chart-poverty-trend"
              title={`Poverty fell ${povertyDrop} points in seven years`}
              note={`${before.period} is NISR's estimate recalculated on the EICV7 method, so the two periods compare directly. ${now.note}.`}
              howToRead="Each pair of bars is one survey period: the first bar is poverty, the second extreme poverty. Shorter bars in 2023/24 mean fewer people below each line."
              source={EICV7_PROFILE_SOURCE}
            >
              <PovertyTrendChart />
            </ChartCard>
            <ChartCard
              id="chart-living-conditions"
              title="Living conditions improved on every measure"
              note="Share of households with each condition. Improved drinking water is at least 90% in 2023/24."
              howToRead="Grey is 2016/17, cyan is 2023/24. A longer cyan bar means more households had that condition in 2023/24."
              source={EICV7_PROFILE_SOURCE}
            >
              <ComparisonBars
                rows={LIVING_STANDARDS_BY_YEAR}
                categoryKey="measure"
                series={SURVEY_ROUND_SERIES}
                description={`Living conditions in 2016/17 and 2023/24. ${LIVING_STANDARDS_BY_YEAR.map((row) => `${row.measure}: ${row.in2017}% then ${row.in2024}%`).join("; ")}.`}
              />
            </ChartCard>
          </div>
        </div>
      </section>

      <div id="where" className="scroll-mt-36">
        <PovertyMapSection />
        <section
          className="border-t border-line bg-white py-16 sm:py-20"
          aria-label="Poverty and financial exclusion by province"
        >
          <div className="container-page">
            <Finding
              title="Poverty and exclusion mostly overlap. The North is the exception."
              body="The Western and Southern provinces have the most poverty and the most adults outside formal finance. The Northern Province is the second least poor, yet almost as many of its adults are outside formal finance as in the West."
              stats={[
                {
                  value: `${poorestProvince.povertyRate}%`,
                  label: `of people are poor in the ${poorestProvince.province} Province, the highest rate (district rates weighted by population)`,
                  color: DEEP_CYAN,
                },
              ]}
            >
              <ChartCard
                id="chart-province-poverty-finance"
                title="Poverty and adults outside formal finance, by province"
                note={`Each district's published rate, weighted by its 2022 population for poverty and its projected 2024 adults for finance. Nationally this gives ${povertyIn()}% and ${notFormallyIncludedIn()}%, against the published ${reference("eicv7_poverty_rate").value}% and ${reference("finscope_not_formally_included").value}%.`}
                howToRead="For each province, one bar is the poverty rate and the other the share of adults outside formal finance. Where both are long, the two needs overlap."
                source={PROVINCE_SOURCE}
                status="calculated"
              >
                <ComparisonBars
                  rows={provinceRows}
                  categoryKey="province"
                  series={PROVINCE_SERIES}
                  labelWidth={64}
                  description={`Poverty rate and adults not formally included, by province. ${provinceRows.map((row) => `${row.province}: poverty ${row.povertyRate}%, not formally included ${row.notFormallyIncluded}%`).join("; ")}.`}
                />
              </ChartCard>
            </Finding>
          </div>
        </section>
      </div>

      <section id="who" className="scroll-mt-36 bg-paper py-16 sm:py-20" aria-labelledby="who-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="Who is poorest"
            title={<span id="who-heading">The poorest households read less and use finance less</span>}
            intro={`In the poorest fifth, ${poorestLiteracy.literacyRate}% of people can read and write, against ${richestLiteracy.literacyRate}% in the richest. Only ${poorestWomen.either}% of women in the poorest households used a bank account or mobile money in the past year, against ${richestWomen.either}% in the richest.`}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <ChartCard
              id="chart-literacy"
              title="The poorest are least literate"
              note="Literacy rate by fifth of consumption per adult, 2023/24."
              howToRead="The first bar is the poorest fifth of people, the second the richest; the taller the bar, the higher the share who can read and write."
              source={EICV7_PROFILE_SOURCE}
            >
              <ValueBars
                seriesName="Literacy rate"
                bars={LITERACY_BY_QUINTILE.map((row, index) => ({
                  label: row.quintile,
                  value: row.literacyRate,
                  color: index === 0 ? CORE.cyan : DEEP_CYAN,
                }))}
                description={`Literacy rate: ${LITERACY_BY_QUINTILE.map((row) => `${row.quintile} ${row.literacyRate}%`).join(", ")}.`}
              />
            </ChartCard>
            <ChartCard
              id="chart-use-by-wealth"
              title="Account or mobile money use rises with wealth"
              note="Women and men aged 15 to 49 who used a bank account or mobile money in the past year, by household wealth fifth."
              howToRead="Groups run from the poorest fifth of households to the richest. In each, one bar is women and one is men; longer means more used an account or mobile money."
              source={DHS_SOURCE}
            >
              <ComparisonBars
                rows={useByWealth}
                categoryKey="wealth"
                series={SEX_SERIES}
                description={`Used a bank account or mobile money in the past year, by wealth fifth. ${useByWealth.map((row) => `${row.wealth}: women ${row.women}%, men ${row.men}%`).join("; ")}.`}
              />
            </ChartCard>
          </div>
        </div>
      </section>

      <section id="living" className="scroll-mt-36 bg-white py-16 sm:py-20" aria-labelledby="living-heading">
        <div className="container-page">
          <SectionHeader
            eyebrow="How households live"
            title={<span id="living-heading">Most homes cook with wood, and more than one in four has no electricity</span>}
            intro={`${householdsWithElectricity}% of households have electricity, from the grid or solar. ${woodOrStraw}% still cook mainly with firewood or straw, and ${plannedVillageShare}% live in planned rural villages (umudugudu).`}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <ChartCard
              id="chart-electricity"
              title={`${householdsWithElectricity}% of households have electricity`}
              note={`Households by main source, 2023/24. No electricity is 100% minus the ${householdsWithElectricity}% with access.`}
              howToRead="The strip at the top is all households, split by their main source of electricity. Below it, each bar is one source; grey is no electricity."
              source={EICV7_PROFILE_SOURCE}
            >
              <ShareBars
                segments={ELECTRICITY_SOURCES.map((row) => ({
                  label: row.source,
                  share: row.share,
                  color: ELECTRICITY_COLORS[row.source],
                }))}
              />
            </ChartCard>
            <ChartCard
              id="chart-cooking-fuel"
              title={`${woodOrStraw}% of households cook with firewood or straw`}
              note="Main cooking fuel, 2023/24. Gas and other is the 24% using improved methods, minus 19% charcoal."
              howToRead="Each bar is the share of households cooking mainly with that fuel. Dark cyan is wood or straw, bright cyan is cleaner fuel."
              source={EICV7_PROFILE_SOURCE}
            >
              <ValueBars
                orientation="row"
                seriesName="Households"
                labelWidth={92}
                bars={COOKING_FUELS.map((row) => ({ label: row.fuel, value: row.share, color: COOKING_FUEL_COLORS[row.fuel] }))}
                description={`Main cooking fuel: ${COOKING_FUELS.map((row) => `${row.fuel} ${row.share}%`).join(", ")}.`}
              />
            </ChartCard>
            <ChartCard
              id="chart-settlement"
              title={`${plannedVillageShare}% of households live in planned villages`}
              note="Households by type of settlement, 2023/24."
              howToRead="The strip at the top is all households, split by the kind of place they live in. Below it, each bar is one kind; the longest is planned rural villages (umudugudu)."
              source={EICV7_PROFILE_SOURCE}
            >
              <ShareBars
                segments={SETTLEMENT_TYPES.map((row, index) => ({
                  label: row.settlement,
                  share: row.share,
                  color: SETTLEMENT_COLORS[index],
                }))}
                highlight={SETTLEMENT_TYPES[0].settlement}
              />
            </ChartCard>
          </div>
        </div>
      </section>
    </>
  );
}
