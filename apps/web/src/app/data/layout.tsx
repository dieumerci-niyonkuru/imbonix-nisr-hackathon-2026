import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Pages in this section name it in their title, so a browser tab says where the page sits: "Page · Data". */
export const metadata: Metadata = {
  title: { template: "%s · Data | IMBONIX", default: "Data | IMBONIX" },
};

export default function SectionLayout({ children }: { children: ReactNode }) {
  return children;
}
