import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../day-two-activities.module.css";

export default async function CauseRankingResultsPage({
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
          <Link href="/day/2/causes-of-death">Activity 3</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 3 · Class results</p>
          <h1>How did the class rank the causes?</h1>
        </header>
        <LiveResults activityKey="causes-of-death" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
