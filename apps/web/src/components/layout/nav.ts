import type { ComponentType, SVGProps } from "react";
import {
  AdjustmentsHorizontalIcon,
  BanknotesIcon,
  BookOpenIcon,
  ChartPieIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  FlagIcon,
  HomeIcon,
  MapIcon,
  MapPinIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

/**
 * The three things IMBONIX focuses on: a real gap, what NISR data shows about it, and who can act on it. They are the
 * homepage tabs, and the header links open them (the tabs follow the URL hash, for example /#evidence).
 */
export const FOCUS_AREAS = [
  { id: "gap", label: "The gap", hint: "Included, but not resilient" },
  { id: "evidence", label: "The evidence", hint: "Poverty, income and access" },
  { id: "impact", label: "The impact", hint: "Who can act, and where" },
] as const;

export type FocusAreaId = (typeof FOCUS_AREAS)[number]["id"];

/** `badge` is a short label shown next to the page in the menus, such as the survey behind it or its status. */
export type NavItem = { href: string; label: string; description: string; badge?: string };
export type NavGroup = { label: string; intro: string; items: NavItem[] };

/** Pages grouped by what a visitor wants to do: explore places, understand patterns, or act on them. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Explore",
    intro: "See the numbers, place by place.",
    items: [
      { href: "/dashboard", label: "Dashboard", description: "National inclusion, poverty and progress to targets" },
      { href: "/map", label: "Resilience map", description: "Every district on 25 measures of vulnerability" },
      { href: "/districts", label: "District profiles", description: "Four dimensions, indicators and sectors per district" },
    ],
  },
  {
    label: "Insights",
    intro: "Understand the patterns.",
    items: [
      {
        href: "/vulnerability",
        label: "Vulnerability analysis",
        description: "Where poverty, exclusion, nutrition and shocks overlap",
      },
      {
        href: "/access-vs-use",
        label: "Access vs use",
        description: "Who actually uses a bank account or mobile money",
        badge: "DHS 2025",
      },
      { href: "/social-protection", label: "Social protection", description: "How VUP payments reach households" },
    ],
  },
  {
    label: "Act",
    intro: "Turn the evidence into choices.",
    items: [
      { href: "/priorities", label: "Intervention priorities", description: "Where the evidence points for seven policy levers" },
      { href: "/scenarios", label: "Scenario simulator", description: "Test inclusion targets and priority weights" },
      {
        href: "/model",
        label: "Explainable model",
        description: "What is associated with financial vulnerability (pending microdata)",
        badge: "Pending",
      },
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
