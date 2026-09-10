import { DayAccessGate } from "../../components/day-access-gate";

export const dynamic = "force-dynamic";

export default function DayThreeLayout({ children }: { children: React.ReactNode }) {
  return <DayAccessGate dayNumber={3}>{children}</DayAccessGate>;
}
