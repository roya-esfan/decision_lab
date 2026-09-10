import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../crew-problem/crew-problem.module.css";

export default async function RareDiseaseValuationResultsPage({
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
          <Link href="/day/3/rare-disease-valuation">Activity 6</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 3 · Activity 6 · Class results</p>
          <h1>What amount would you choose?</h1>
        </header>
        <LiveResults activityKey="rare-disease-valuation" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
