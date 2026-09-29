/**
 * Every chart on the site, for the search and the list of all charts: a plain name, what it shows, and the page and
 * anchor it opens. The anchor is the chart's own `id`; a test checks that each one exists in the source.
 * `interactive` marks a tool the visitor drives (a map, an explorer, a scenario) rather than a fixed chart.
 */
export type ChartEntry = { id: string; title: string; about: string; page: string; interactive?: boolean };

export const CHART_INDEX: ChartEntry[] = [
  // Financial exclusion at a glance
  {
    id: "chart-inclusion-by-service",
    title: "Inclusion rose, bank use did not",
    about: "Adults using each kind of financial service, 2020 and 2024",
    page: "/financial-exclusion",
  },
  {
    id: "chart-financial-health",
    title: "Financial health of adults",
    about: "Healthy, coping, vulnerable and extremely vulnerable adults, 2024",
    page: "/financial-exclusion",
  },
  {
    id: "chart-access-strand",
    title: "Adults relying only on informal services",
    about: "Every adult by the most formal service they use, 2020 and 2024",
    page: "/financial-exclusion",
  },
  {
    id: "chart-mobile-money",
    title: "Mobile money ownership and daily use",
    about: "Wallets, weekly use and daily use, 2020 and 2024",
    page: "/financial-exclusion",
  },
  {
    id: "chart-credit-sources",
    title: "Where households borrow",
    about: "Tontines, relatives, SACCOs, banks and other sources of credit",
    page: "/financial-exclusion",
  },
  {
    id: "chart-bank-account-by-sex",
    title: "Bank accounts for women and men",
    about: "Adults with a bank account, by sex",
    page: "/financial-exclusion",
  },
  // Poverty dynamics at a glance
  {
    id: "chart-province-poverty-finance",
    title: "Poverty and financial exclusion by province",
    about: "Each province's poverty rate beside its share of adults outside formal finance",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-use-by-wealth",
    title: "Account or mobile money use by wealth",
    about: "Women and men from the poorest fifth to the richest",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-poverty-trend",
    title: "Poverty rate, 2016/17 and 2023/24",
    about: "How far national poverty fell in seven years",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-living-conditions",
    title: "Living conditions, 2016/17 and 2023/24",
    about: "Water, sanitation, electricity and housing",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-electricity",
    title: "Households with electricity",
    about: "Main source of electricity: national grid, solar or none",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-cooking-fuel",
    title: "Cooking fuel",
    about: "Firewood, straw, charcoal, gas and other fuels",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-literacy",
    title: "Literacy by wealth",
    about: "Share who can read and write, from the poorest fifth to the richest",
    page: "/poverty-dynamics",
  },
  {
    id: "chart-settlement",
    title: "Where households live",
    about: "Planned villages (umudugudu), dispersed, informal and urban settlements",
    page: "/poverty-dynamics",
  },
  // Social protection at a glance
  {
    id: "chart-payment-timeliness",
    title: "VUP payments on time or late",
    about: "How late the last VUP payment was, by programme",
    page: "/social-protection",
  },
  {
    id: "chart-national-targets",
    title: "Progress to national targets",
    about: "Baselines against the 2030 financial inclusion and social protection targets",
    page: "/social-protection",
  },
  {
    id: "chart-vup-poverty",
    title: "Poverty among VUP beneficiaries",
    about: "Poverty rate among VUP beneficiaries and nationally",
    page: "/social-protection",
  },
  {
    id: "chart-vup-by-sex",
    title: "VUP beneficiaries by sex",
    about: "Women's and men's share of the population and of VUP beneficiaries",
    page: "/social-protection",
  },
  {
    id: "chart-vup-programmes",
    title: "VUP beneficiaries by programme",
    about: "Nutrition sensitive Direct Support, Direct Support, public works and other programmes",
    page: "/social-protection",
  },
  // Rwanda in figures
  {
    id: "chart-dashboard-access",
    title: "Access has deepened, but banking has not",
    about: "Adults by the most formal service they use, 2020 and 2024",
    page: "/data/rwanda-in-figures",
  },
  {
    id: "chart-dashboard-health",
    title: "Financial health against the 2030 targets",
    about: "Healthy, coping and vulnerable adults in 2024 and the Roadmap targets",
    page: "/data/rwanda-in-figures",
  },
  {
    id: "chart-dashboard-poverty-trend",
    title: "Poverty and extreme poverty, 2016/17 and 2023/24",
    about: "National poverty on the EICV7 method",
    page: "/data/rwanda-in-figures",
  },
  {
    id: "chart-dashboard-poverty-province",
    title: "Poverty by province, 2023/24",
    about: "Share of people below the poverty line in each province",
    page: "/data/rwanda-in-figures",
  },
  // Change over time
  {
    id: "chart-poverty-by-province-change",
    title: "Poverty by province, 2016/17 and 2023/24",
    about: "Rwanda and each province, before and after",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-extreme-poverty-by-province-change",
    title: "Extreme poverty by province, 2016/17 and 2023/24",
    about: "People below the food poverty line, before and after",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-population-censuses",
    title: "Population at every census since 1978",
    about: "Census counts from 1978 to 2022, and NISR's projection to 2032",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-household-size",
    title: "Average household size",
    about: "People per household in each EICV round since 2005/06",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-homes-over-time",
    title: "Homes over time",
    about: "Electricity, water, sanitation, roofs, floors and cooking fuel, EICV round by round",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-services-over-time",
    title: "Services over time",
    about: "Time to a health centre, health insurance, school, phones, internet and planned villages",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-child-mortality",
    title: "Child deaths per 1,000 live births",
    about: "Infant and under five mortality in every DHS round since 1992",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-maternal-mortality",
    title: "Maternal deaths per 100,000 live births",
    about: "Maternal mortality in every DHS round since 2000",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-child-nutrition",
    title: "Stunting, underweight and wasting",
    about: "Children under five in every DHS round since 1992",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-maternal-child-care",
    title: "Care around birth",
    about: "Assisted delivery, vaccination, contraception and children per woman",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-labour-market",
    title: "Participation, employment and unemployment",
    about: "The Labour Force Survey, 2019 to 2024",
    page: "/poverty-dynamics/change-over-time",
  },
  {
    id: "chart-district-unemployment-spread",
    title: "Unemployment across the 30 districts",
    about: "Lowest, median and highest district each year, 2017 to 2025",
    page: "/poverty-dynamics/change-over-time",
  },
  // Map of every district
  {
    id: "chart-district-map",
    title: "Map of every district",
    about: "Any of the measures on a map of the 30 districts and their sectors",
    page: "/poverty-dynamics/district-map",
    interactive: true,
  },
  // Who uses financial services
  {
    id: "chart-usage-explorer",
    title: "Account and mobile money use by group",
    about: "Women and men by age, residence, education, province and wealth",
    page: "/financial-exclusion/who-uses-financial-services",
    interactive: true,
  },
  // VUP support and payments
  {
    id: "chart-vup-timeliness",
    title: "How late was the last VUP payment",
    about: "On time, up to 10, 20 and more than 20 days late, by programme",
    page: "/social-protection/vup-payments",
  },
  {
    id: "chart-vup-timeliness-by-poverty",
    title: "Paid on time, by poverty status",
    about: "Whether the poorest participants wait longer, by programme",
    page: "/social-protection/vup-payments",
  },
  {
    id: "chart-vup-payment-channel",
    title: "How beneficiaries collect their payment",
    about: "Umurenge SACCO counter or mobile money, by programme",
    page: "/social-protection/vup-payments",
  },
  {
    id: "chart-vup-amounts",
    title: "What households receive",
    about: "Average VUP amounts reported by beneficiaries, in Rwandan francs",
    page: "/social-protection/vup-payments",
  },
  {
    id: "chart-vup-timeliness-trend",
    title: "VUP payment timing over ten years",
    about: "Direct Support households paid on time or late, 2013/14 to 2023/24",
    page: "/social-protection/vup-payments",
  },
  // Where to act first
  {
    id: "chart-priority-explorer",
    title: "Where each policy lever points",
    about: "Districts flagged for each of seven policy levers",
    page: "/social-protection/where-to-act-first",
    interactive: true,
  },
  {
    id: "chart-priority-matrix",
    title: "Every district against every lever",
    about: "Which levers flag which districts, all at once",
    page: "/social-protection/where-to-act-first",
    interactive: true,
  },
  // Test a policy target
  {
    id: "chart-reach-scenario",
    title: "Adults to reach for an inclusion target",
    about: "How many adults each district would need to include to meet a target",
    page: "/social-protection/test-a-policy-target",
    interactive: true,
  },
  {
    id: "chart-priority-weights",
    title: "Priorities under your own weights",
    about: "How the district ranking shifts as you weight each dimension",
    page: "/social-protection/test-a-policy-target",
    interactive: true,
  },
  // Where needs overlap
  {
    id: "overlap-matrix",
    title: "All 30 districts on the four dimensions",
    about: "Poverty, financial exclusion, stunting and shocks, district by district",
    page: "/poverty-dynamics/where-needs-overlap",
  },
  {
    id: "chart-scatter-finance",
    title: "Poverty and financial exclusion, by district",
    about: "Each district's poverty rate against its adults outside formal finance",
    page: "/poverty-dynamics/where-needs-overlap",
  },
  {
    id: "chart-scatter-stunting",
    title: "Poverty and child stunting, by district",
    about: "Each district's poverty rate against its share of stunted children",
    page: "/poverty-dynamics/where-needs-overlap",
  },
];
