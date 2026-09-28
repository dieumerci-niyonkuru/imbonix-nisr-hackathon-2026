/**
 * Every chart on the site, for the search: a plain name, what it shows, and the page and anchor it opens. The anchor
 * is the chart's own `id`; a test checks that each one exists in the source.
 */
export type ChartEntry = { id: string; title: string; about: string; page: string };

export const CHART_INDEX: ChartEntry[] = [
  // Financial exclusion at a glance
  {
    id: "chart-inclusion-by-service",
    title: "Inclusion rose, bank use did not",
    about: "Adults using each kind of financial service, 2020 and 2024",
    page: "/focus/exclusion",
  },
  {
    id: "chart-financial-health",
    title: "Financial health of adults",
    about: "Healthy, coping, vulnerable and extremely vulnerable adults, 2024",
    page: "/focus/exclusion",
  },
  {
    id: "chart-access-strand",
    title: "Adults relying only on informal services",
    about: "Every adult by the most formal service they use, 2020 and 2024",
    page: "/focus/exclusion",
  },
  {
    id: "chart-mobile-money",
    title: "Mobile money ownership and daily use",
    about: "Wallets, weekly use and daily use, 2020 and 2024",
    page: "/focus/exclusion",
  },
  {
    id: "chart-credit-sources",
    title: "Where households borrow",
    about: "Tontines, relatives, SACCOs, banks and other sources of credit",
    page: "/focus/exclusion",
  },
  {
    id: "chart-bank-account-by-sex",
    title: "Bank accounts for women and men",
    about: "Adults with a bank account, by sex",
    page: "/focus/exclusion",
  },
  // Poverty dynamics at a glance
  {
    id: "chart-province-poverty-finance",
    title: "Poverty and financial exclusion by province",
    about: "Each province's poverty rate beside its share of adults outside formal finance",
    page: "/focus/poverty",
  },
  {
    id: "chart-use-by-wealth",
    title: "Account or mobile money use by wealth",
    about: "Women and men from the poorest fifth to the richest",
    page: "/focus/poverty",
  },
  {
    id: "chart-poverty-trend",
    title: "Poverty rate, 2017 and 2024",
    about: "How far national poverty fell in seven years",
    page: "/focus/poverty",
  },
  {
    id: "chart-living-conditions",
    title: "Living conditions, 2017 and 2024",
    about: "Water, sanitation, electricity and housing",
    page: "/focus/poverty",
  },
  {
    id: "chart-electricity",
    title: "Households with electricity",
    about: "Main source of electricity: national grid, solar or none",
    page: "/focus/poverty",
  },
  {
    id: "chart-cooking-fuel",
    title: "Cooking fuel",
    about: "Firewood, straw, charcoal, gas and other fuels",
    page: "/focus/poverty",
  },
  {
    id: "chart-literacy",
    title: "Literacy by wealth",
    about: "Share who can read and write, from the poorest fifth to the richest",
    page: "/focus/poverty",
  },
  {
    id: "chart-settlement",
    title: "Where households live",
    about: "Planned villages (umudugudu), dispersed, informal and urban settlements",
    page: "/focus/poverty",
  },
  // Social protection at a glance
  {
    id: "chart-payment-timeliness",
    title: "VUP payments on time or late",
    about: "How late the last VUP payment was, by programme",
    page: "/focus/protection",
  },
  {
    id: "chart-national-targets",
    title: "Progress to national targets",
    about: "Baselines against the 2030 financial inclusion and social protection targets",
    page: "/focus/protection",
  },
  {
    id: "chart-vup-poverty",
    title: "Poverty among VUP beneficiaries",
    about: "Poverty rate among VUP beneficiaries and nationally",
    page: "/focus/protection",
  },
  {
    id: "chart-vup-by-sex",
    title: "VUP beneficiaries by sex",
    about: "Women's and men's share of the population and of VUP beneficiaries",
    page: "/focus/protection",
  },
  {
    id: "chart-vup-programmes",
    title: "VUP beneficiaries by programme",
    about: "Nutrition sensitive Direct Support, Direct Support, public works and other programmes",
    page: "/focus/protection",
  },
  // Rwanda in figures
  {
    id: "chart-dashboard-access",
    title: "Access has deepened, but banking has not",
    about: "Adults by the most formal service they use, 2020 and 2024",
    page: "/dashboard",
  },
  {
    id: "chart-dashboard-health",
    title: "Financial health against the 2030 targets",
    about: "Healthy, coping and vulnerable adults in 2024 and the Roadmap targets",
    page: "/dashboard",
  },
  {
    id: "chart-dashboard-poverty-trend",
    title: "Poverty and extreme poverty, 2016/17 and 2023/24",
    about: "National poverty on the EICV7 method",
    page: "/dashboard",
  },
  {
    id: "chart-dashboard-poverty-province",
    title: "Poverty by province, 2023/24",
    about: "Share of people below the poverty line in each province",
    page: "/dashboard",
  },
  // Where needs overlap
  {
    id: "overlap-matrix",
    title: "All 30 districts on the four dimensions",
    about: "Poverty, financial exclusion, stunting and shocks, district by district",
    page: "/vulnerability",
  },
  {
    id: "chart-scatter-finance",
    title: "Poverty and financial exclusion, by district",
    about: "Each district's poverty rate against its adults outside formal finance",
    page: "/vulnerability",
  },
  {
    id: "chart-scatter-stunting",
    title: "Poverty and child stunting, by district",
    about: "Each district's poverty rate against its share of stunted children",
    page: "/vulnerability",
  },
];
