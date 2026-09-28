/**
 * The three focus areas: financial exclusion, poverty dynamics and the impact of social protection. They are the homepage tabs (which follow the URL hash, for example /#poverty) and the header menus.
 */
export const FOCUS_AREAS = [
  { id: "exclusion", label: "Financial exclusion", hint: "Included, but not resilient" },
  { id: "poverty", label: "Poverty dynamics", hint: "Who is poor, where, and what changed" },
  { id: "protection", label: "Social protection", hint: "Who is reached, and how well" },
] as const;

export type FocusAreaId = (typeof FOCUS_AREAS)[number]["id"];

/** `badge` is a short label shown next to the page in the menus, such as the survey behind it or its status. */
export type NavItem = { href: string; label: string; description: string; badge?: string };
/** Each group is one focus area: `focusId` is its homepage tab. */
export type NavGroup = { label: string; intro: string; focusId: FocusAreaId; items: NavItem[] };

/**
 * Pages grouped by the focus area they answer, in the same order as the focus areas. Names say what a visitor will
 * find, in everyday words, and are used the same way in the menus, footer, search, breadcrumbs and page headings.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Financial exclusion",
    intro: "Who is outside formal finance, and who has access but does not use it.",
    focusId: "exclusion",
    items: [
      { href: "/dashboard", label: "Rwanda in figures", description: "Key national figures and progress to the 2030 targets" },
      {
        href: "/access-vs-use",
        label: "Who uses financial services",
        description: "Who has an account, and who actually uses one",
        badge: "DHS 2025",
      },
      {
        href: "/model",
        label: "Who is most at risk",
        description: "Household analysis, coming when NISR releases the microdata",
        badge: "Pending",
      },
    ],
  },
  {
    label: "Poverty dynamics",
    intro: "Where poverty is deepest, and where it overlaps with other needs.",
    focusId: "poverty",
    items: [
      { href: "/map", label: "Map of every district", description: "Compare the 30 districts on 25 measures" },
      { href: "/districts", label: "Find your district", description: "Figures and sectors for each of the 30 districts" },
      { href: "/vulnerability", label: "Where needs overlap", description: "Poverty, exclusion, nutrition and shocks together" },
    ],
  },
  {
    label: "Social protection",
    intro: "How VUP reaches households, and where support should go next.",
    focusId: "protection",
    items: [
      {
        href: "/social-protection",
        label: "VUP support and payments",
        description: "Who VUP reaches, and whether payments arrive on time",
      },
      { href: "/priorities", label: "Where to act first", description: "Seven policy levers, flagged district by district" },
      { href: "/scenarios", label: "Test a policy target", description: "See what a target would mean for each district" },
    ],
  },
];

/** Top-level links shown without a dropdown. */
export const NAV_LINKS: NavItem[] = [
  { href: "/data", label: "Data & methods", description: "Where every figure comes from, and how far to trust it" },
];

/** Flat list (for the footer and sitemap), starting with the overview. */
export const NAV: NavItem[] = [
  { href: "/", label: "Homepage", description: "What IMBONIX shows and why it matters" },
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...NAV_LINKS,
];

export const NISR_CATALOG_URL = "https://microdata.statistics.gov.rw/index.php/catalog";

/** The surveys and censuses behind the figures, each with its study number in the NISR microdata catalog. */
export const SOURCE_STUDIES = [
  { label: "EICV7 2023/24", studyId: 119 },
  { label: "FinScope 2024", studyId: 120 },
  { label: "DHS 2025", studyId: 126 },
  { label: "CFSVA 2024", studyId: 122 },
  { label: "Census 2022", studyId: 109 },
  { label: "LFS 2025", studyId: 125 },
  { label: "Establishment Census 2023", studyId: 112 },
];

export const REPOSITORY_URL = "https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026";

/** Links outside the site, in the thin bar above the header and at the end of the phone menu. */
export const UTILITY_LINKS = [
  { href: NISR_CATALOG_URL, label: "NISR microdata catalog" },
  { href: REPOSITORY_URL, label: "Source code" },
  { href: `${REPOSITORY_URL}/issues/new?template=data_issue.md`, label: "Report a data issue" },
];
