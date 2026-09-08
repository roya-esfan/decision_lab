import { DayAccessGate } from "../../components/day-access-gate";

export const dynamic = "force-dynamic";

export default function DayOneLayout({ children }: { children: React.ReactNode }) {
  return <DayAccessGate dayNumber={1}>{children}</DayAccessGate>;
}
