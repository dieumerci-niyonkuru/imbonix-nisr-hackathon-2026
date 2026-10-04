import { MAP_LAYERS } from "@/lib/indicators";

/**
 * The three focus areas of the challenge: financial inclusion, poverty & vulnerability and social protection.
 * Each has its own section of the site: `href` is its overview page, and its pages sit under that address, so a
 * URL such as /poverty-dynamics/trends says where you are. They are also the homepage tabs (which follow
 * the URL hash, for example /#poverty) and the header menus.
 */
export const FOCUS_AREAS = [
  { id: "exclusion", label: "Financial inclusion", hint: "Included, but not resilient", href: "/financial-exclusion" },
  {
    id: "poverty",
    label: "Poverty & vulnerability",
    hint: "Who is poor and vulnerable, where, and what changed",
    href: "/poverty-dynamics",
  },
  { id: "protection", label: "Priority areas", hint: "Where to act first, and who VUP reaches", href: "/social-protection" },
] as const;

export type FocusAreaId = (typeof FOCUS_AREAS)[number]["id"];

/** `badge` is a short label shown next to the page in the menus, such as the survey behind it or its status. */
export type NavItem = { href: string; label: string; description: string; badge?: string };
/** Each group is one focus area: `focusId` is its homepage tab and `href` its overview page. */
export type NavGroup = { label: string; intro: string; focusId: FocusAreaId; href: string; items: NavItem[] };

/**
 * A header menu: its landing page (a focus area's overview, or Sources and methods), then the pages under it. `title` is
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
    label: "Financial inclusion",
    intro: "Who reaches formal finance, who is left out, and who has access but cannot yet use it to cope.",
    focusId: "exclusion",
    href: areaHref("exclusion"),
    items: [
      {
        href: "/financial-exclusion/access-and-use",
        label: "Access and use",
        description: "Who has an account, and who actually uses one",
        badge: "DHS 2025",
      },
      {
        href: "/financial-exclusion/risk-model",
        label: "AI insights",
        description: "An explainable model of household financial vulnerability, with its method and limits",
        badge: "AI",
      },
    ],
  },
  {
    label: "Poverty & vulnerability",
    intro: "How poverty and living conditions changed, where poverty is deepest, and where it overlaps with other needs.",
    focusId: "poverty",
    href: areaHref("poverty"),
    items: [
      {
        href: "/poverty-dynamics/trends",
        label: "Trends",
        description: "Poverty, living conditions, health and work, from the first census to the latest surveys",
      },
      {
        href: "/poverty-dynamics/district-map",
        label: "Rwanda map",
        description: `Compare the 30 districts on ${MAP_LAYERS.length} measures`,
      },
      {
        href: "/districts",
        label: "District profiles",
        description: "Figures, trends and sectors for each of the 30 districts",
      },
      {
        href: "/poverty-dynamics/overlapping-needs",
        label: "Overlapping needs",
        description: "Poverty, exclusion, nutrition and shocks together",
      },
    ],
  },
  {
    label: "Priority areas",
    intro: "Where to act first: who VUP reaches, how payments arrive, and the levers, scenarios and plans for targeting.",
    focusId: "protection",
    href: areaHref("protection"),
    items: [
      {
        href: "/social-protection/vup-payments",
        label: "VUP payments",
        description: "Who VUP reaches, and whether payments arrive on time",
      },
      {
        href: "/social-protection/priority-districts",
        label: "Priority ranking",
        description: "Where to act first: seven policy levers, flagged district by district",
      },
      {
        href: "/social-protection/policy-scenarios",
        label: "Policy scenarios",
        description: "See what a target would mean for each district",
      },
      {
        href: "/social-protection/intervention-planner",
        label: "Intervention planner",
        description: "Pick a problem, a group and a place: see the evidence and the options",
      },
    ],
  },
];

/** The data itself: where every figure comes from, the national figures, and every chart on the site in one list. */
export const DATA_SECTION: MenuSection = {
  id: "data",
  label: "Data",
  intro: "The datasets behind the platform, Rwanda's key figures, and every chart on the site in one list.",
  href: "/data",
  title: "Data & methodology",
  landingLabel: "Data & methodology",
  landingDescription: "Where every figure comes from, and how far to trust it",
  items: [
    {
      href: "/data/key-figures",
      label: "Key figures",
      description: "Key national figures and progress to the 2030 targets",
    },
    { href: "/data/chart-library", label: "Chart library", description: "Every chart on the site, grouped by focus area" },
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
    landingLabel: "Overview",
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
      label: section.landingLabel === "Overview" ? `${section.label} overview` : section.title,
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
