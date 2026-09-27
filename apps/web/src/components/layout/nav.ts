import type { ComponentType, SVGProps } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  BookOpenIcon,
  ChartPieIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  FlagIcon,
  HomeIcon,
  MapIcon,
  MapPinIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

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

/** Pages grouped by the focus area they answer, in the same order as the homepage tabs. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Financial exclusion",
    intro: "Who is outside formal finance, and who has access but does not use it.",
    focusId: "exclusion",
    items: [
      { href: "/dashboard", label: "Dashboard", description: "National inclusion, poverty and progress to targets" },
      {
        href: "/access-vs-use",
        label: "Access vs use",
        description: "Who actually uses a bank account or mobile money",
        badge: "DHS 2025",
      },
      {
        href: "/model",
        label: "Explainable model",
        description: "What is associated with financial vulnerability (pending microdata)",
        badge: "Pending",
      },
    ],
  },
  {
    label: "Poverty dynamics",
    intro: "Where poverty is deepest, and where it overlaps with other needs.",
    focusId: "poverty",
    items: [
      { href: "/map", label: "Resilience map", description: "Every district on 25 measures of vulnerability" },
      { href: "/districts", label: "District profiles", description: "Four dimensions, indicators and sectors per district" },
      {
        href: "/vulnerability",
        label: "Vulnerability analysis",
        description: "Where poverty, exclusion, nutrition and shocks overlap",
      },
    ],
  },
  {
    label: "Social protection",
    intro: "How VUP reaches households, and where support should go next.",
    focusId: "protection",
    items: [
      { href: "/social-protection", label: "VUP delivery", description: "How VUP payments reach households" },
      { href: "/priorities", label: "Intervention priorities", description: "Where the evidence points for seven policy levers" },
      { href: "/scenarios", label: "Scenario simulator", description: "Test inclusion targets and priority weights" },
    ],
  },
];

/** Top-level links shown without a dropdown. */
export const NAV_LINKS: NavItem[] = [
  { href: "/data", label: "Data & methods", description: "Sources, value labels, caveats and the NISR catalog" },
];

/** Flat list (for the footer and sitemap), starting with the overview. */
export const NAV: NavItem[] = [
  { href: "/", label: "Overview", description: "What IMBONIX shows and why it matters" },
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...NAV_LINKS,
];

/** One icon per page, shared by the menus, the search and the homepage tool grid. */
export const NAV_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "/": HomeIcon,
  "/dashboard": ChartPieIcon,
  "/map": MapIcon,
  "/districts": MapPinIcon,
  "/vulnerability": Squares2X2Icon,
  "/access-vs-use": DevicePhoneMobileIcon,
  "/social-protection": BanknotesIcon,
  "/priorities": FlagIcon,
  "/scenarios": AdjustmentsHorizontalIcon,
  "/model": CpuChipIcon,
  "/data": BookOpenIcon,
};

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

/** One icon per homepage focus area, shared by the header menu and the search. */
export const FOCUS_AREA_ICONS: Record<FocusAreaId, ComponentType<SVGProps<SVGSVGElement>>> = {
  exclusion: ScaleIcon,
  poverty: ArrowTrendingDownIcon,
  protection: ShieldCheckIcon,
};

export const REPOSITORY_URL = "https://github.com/dieumerci-niyonkuru/imbonix-nisr-hackathon-2026";

/** Links outside the site, in the thin bar above the header and at the end of the phone menu. */
export const UTILITY_LINKS = [
  { href: NISR_CATALOG_URL, label: "NISR microdata catalog" },
  { href: REPOSITORY_URL, label: "Source code" },
  { href: `${REPOSITORY_URL}/issues/new?template=data_issue.md`, label: "Report a data issue" },
];
