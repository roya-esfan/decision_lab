import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../evaluate-decision.module.css";

export default async function EvaluateDecisionResultsPage({
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
          <Link href="/day/1/evaluate-the-decision">← Evaluate the decision</Link>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 1 · Activity 3 · Class results</p>
          <h1>Evaluate the decision</h1>
          {!instructorRunId && <p>Results are available here in review mode.</p>}
        </header>
        <LiveResults activityKey="outcome-bias" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
