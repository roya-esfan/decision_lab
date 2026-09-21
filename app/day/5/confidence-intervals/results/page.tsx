import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../confidence-intervals.module.css";

export default async function ConfidenceIntervalResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ projector?: string; instructor?: string; run?: string }>;
}) {
  const params = await searchParams;
  const projector = params.projector === "1";
  const instructorRunId = params.instructor === "1" ? params.run : undefined;

  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/5/confidence-intervals">Activity 1</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 5 · Activity 1 · Class results</p>
          <h1>90% confidence intervals</h1>
        </header>
        <LiveResults activityKey="confidence-intervals" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
