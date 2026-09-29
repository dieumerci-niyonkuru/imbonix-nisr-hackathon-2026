import { MAP_LAYERS } from "@/lib/indicators";

/**
 * The three focus areas of the challenge: financial exclusion, poverty dynamics and the impact of social protection.
 * Each has its own section of the site: `href` is its page at a glance, and its pages sit under that address, so a
 * URL such as /poverty-dynamics/change-over-time says where you are. They are also the homepage tabs (which follow
 * the URL hash, for example /#poverty) and the header menus.
 */
export const FOCUS_AREAS = [
  { id: "exclusion", label: "Financial exclusion", hint: "Included, but not resilient", href: "/financial-exclusion" },
  { id: "poverty", label: "Poverty dynamics", hint: "Who is poor, where, and what changed", href: "/poverty-dynamics" },
  { id: "protection", label: "Social protection", hint: "Who is reached, and how well", href: "/social-protection" },
] as const;

export type FocusAreaId = (typeof FOCUS_AREAS)[number]["id"];

/** `badge` is a short label shown next to the page in the menus, such as the survey behind it or its status. */
export type NavItem = { href: string; label: string; description: string; badge?: string };
/** Each group is one focus area: `focusId` is its homepage tab and `href` its page at a glance. */
export type NavGroup = { label: string; intro: string; focusId: FocusAreaId; href: string; items: NavItem[] };

/**
 * A header menu: its landing page (a focus area at a glance, or Data & methods), then the pages under it. `title` is
 * the landing page's own name, used in breadcrumbs; `landingLabel` is how the menus list it.
 */
export type MenuSection = {
  id: string;
  label: string;
  intro: string;
  href: string;
  title: string;
  landingLabel: string;
  landingDescription: string;
  items: NavItem[];
};

const areaHref = (id: FocusAreaId) => FOCUS_AREAS.find((area) => area.id === id)!.href;

/**
 * Pages grouped by the focus area they answer, in the same order as the focus areas. Names say what a visitor will
 * find, in everyday words, and are used the same way in the menus, footer, search, breadcrumbs and page headings.
 * Each page's address is its focus area's address followed by its own name.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Financial exclusion",
    intro: "Who is outside formal finance, and who has access but does not use it.",
    focusId: "exclusion",
    href: areaHref("exclusion"),
    items: [
      {
        href: "/financial-exclusion/who-uses-financial-services",
        label: "Who uses financial services",
        description: "Who has an account, and who actually uses one",
        badge: "DHS 2025",
      },
      {
        href: "/financial-exclusion/who-is-most-at-risk",
        label: "Who is most at risk",
        description: "Household analysis, coming when NISR releases the microdata",
        badge: "Pending",
      },
    ],
  },
  {
    label: "Poverty dynamics",
    intro: "How poverty and living conditions changed, where poverty is deepest, and where it overlaps with other needs.",
    focusId: "poverty",
    href: areaHref("poverty"),
    items: [
      {
        href: "/poverty-dynamics/change-over-time",
        label: "Change over time",
        description: "Poverty, living conditions, health and work, from the first census to the latest surveys",
      },
      {
        href: "/poverty-dynamics/district-map",
        label: "Map of every district",
        description: `Compare the 30 districts on ${MAP_LAYERS.length} measures`,
      },
      {
        href: "/districts",
        label: "Find your district",
        description: "Figures, trends and sectors for each of the 30 districts",
      },
      {
        href: "/poverty-dynamics/where-needs-overlap",
        label: "Where needs overlap",
        description: "Poverty, exclusion, nutrition and shocks together",
      },
    ],
  },
  {
    label: "Social protection",
    intro: "How VUP reaches households, and where support should go next.",
    focusId: "protection",
    href: areaHref("protection"),
    items: [
      {
        href: "/social-protection/vup-payments",
        label: "VUP support and payments",
        description: "Who VUP reaches, and whether payments arrive on time",
      },
      {
        href: "/social-protection/where-to-act-first",
        label: "Where to act first",
        description: "Seven policy levers, flagged district by district",
      },
      {
        href: "/social-protection/test-a-policy-target",
        label: "Test a policy target",
        description: "See what a target would mean for each district",
      },
      {
        href: "/social-protection/plan-an-intervention",
        label: "Plan an intervention",
        description: "Pick a problem, a group and a place: see the evidence and the options",
      },
    ],
  },
];

/** The data itself: where every figure comes from, the national figures, and every chart on the site in one list. */
export const DATA_SECTION: MenuSection = {
  id: "data",
  label: "Data",
  intro: "Where every figure comes from, Rwanda's key figures, and every chart on the site in one list.",
  href: "/data",
  title: "Data & methods",
  landingLabel: "Data & methods",
  landingDescription: "Where every figure comes from, and how far to trust it",
  items: [
    {
      href: "/data/rwanda-in-figures",
      label: "Rwanda in figures",
      description: "Key national figures and progress to the 2030 targets",
    },
    { href: "/data/charts", label: "All charts", description: "Every chart on the site, grouped by focus area" },
  ],
};

/** The header menus, in order: one per focus area, then the data. */
export const MENU_SECTIONS: MenuSection[] = [
  ...NAV_GROUPS.map((group) => ({
    id: group.focusId,
    label: group.label,
    intro: group.intro,
    href: group.href,
    title: group.label,
    landingLabel: "At a glance",
    landingDescription: FOCUS_AREAS.find((area) => area.id === group.focusId)!.hint,
    items: group.items,
  })),
  DATA_SECTION,
];

/** Top-level links shown without a dropdown. */
export const NAV_LINKS: NavItem[] = [
  { href: "/about", label: "About", description: "Why IMBONIX exists, who it serves and how it works" },
];

/** Every page, starting with the homepage: each menu's landing page, then its pages, then the project pages. */
export const NAV: NavItem[] = [
  { href: "/", label: "Homepage", description: "What IMBONIX shows and why it matters" },
  ...MENU_SECTIONS.flatMap((section) => [
    {
      href: section.href,
      label: section.landingLabel === "At a glance" ? `${section.label} at a glance` : section.title,
      description: section.landingDescription,
    },
    ...section.items,
  ]),
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
