import { FocusAreaPage, focusAreaMetadata } from "@/components/focus/focus-area-page";

export const metadata = focusAreaMetadata("exclusion");

/** Financial exclusion overview: the key evidence, then the pages that go deeper. */
export default function FinancialExclusionPage() {
  return <FocusAreaPage areaId="exclusion" />;
}
