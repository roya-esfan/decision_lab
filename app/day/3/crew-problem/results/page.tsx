import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../crew-problem.module.css";

export default async function CrewProblemResultsPage({
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
          <Link href="/day/3/crew-problem">Activity 1</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 3 · Activity 1 · Class results</p>
          <h1>Crew problem</h1>
        </header>
        <LiveResults activityKey="crew-problem" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
