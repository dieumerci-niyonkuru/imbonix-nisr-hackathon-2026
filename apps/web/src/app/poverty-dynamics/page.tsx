import { FocusAreaPage, focusAreaMetadata } from "@/components/focus/focus-area-page";

export const metadata = focusAreaMetadata("poverty");

/** Poverty dynamics at a glance: the key evidence, then the pages that go deeper. */
export default function PovertyDynamicsPage() {
  return <FocusAreaPage areaId="poverty" />;
}
