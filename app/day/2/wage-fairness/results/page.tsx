import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../../3/crew-problem/crew-problem.module.css";

export default async function WageFairnessResultsPage({
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
          <Link href="/day/2/wage-fairness">Activity 6</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 2 · Activity 6 · Class results</p>
          <h1>Fair or unfair?</h1>
        </header>
        <LiveResults activityKey="wage-fairness" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
