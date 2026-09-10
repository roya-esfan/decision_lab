import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../crew-problem/crew-problem.module.css";

export default async function CalculatorTripResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ projector?: string; instructor?: string; run?: string }>;
}) {
  const params = await searchParams;
  const projector = params.projector === "1";
  const instructorRunId = params.instructor === "1" ? params.run : undefined;

  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/3/calculator-trip">Activity 3</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 3 · Activity 3 · Class results</p>
          <h1>Would you make the trip?</h1>
        </header>
        <LiveResults activityKey="calculator-trip" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
