import { DayAccessGate } from "../../components/day-access-gate";

export const dynamic = "force-dynamic";

export default function DayTwoLayout({ children }: { children: React.ReactNode }) {
  return <DayAccessGate dayNumber={2}>{children}</DayAccessGate>;
}
