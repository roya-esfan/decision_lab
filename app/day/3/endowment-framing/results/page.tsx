import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../crew-problem/crew-problem.module.css";

export default async function EndowmentFramingResultsPage({
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
          <Link href="/day/3/endowment-framing">Activity 4</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 3 · Activity 4 · Class results</p>
          <h1>Choose between two options</h1>
        </header>
        <LiveResults activityKey="endowment-framing" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
