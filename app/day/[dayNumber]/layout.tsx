import { DayAccessGate } from "../../components/day-access-gate";

export const dynamic = "force-dynamic";

export default async function DynamicDayLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  return <DayAccessGate dayNumber={Number(dayNumber)}>{children}</DayAccessGate>;
}
