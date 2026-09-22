import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../../3/crew-problem/crew-problem.module.css";

export default async function BeerValuationResultsPage({
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
          <Link href="/day/6/beer-valuation">Activity 1</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 6 · Activity 1 · Class results</p>
          <h1>What price would you pay?</h1>
        </header>
        <LiveResults activityKey="beer-valuation" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
