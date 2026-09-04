import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../bargain.module.css";

export default async function BargainResultsPage({ searchParams }: { searchParams: Promise<{ projector?: string; instructor?: string; run?: string }> }) {
  const params = await searchParams;
  const projector = params.projector === "1";
  const instructorRunId = params.instructor === "1" ? params.run : undefined;
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-1">← A two-player bargain</Link>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 1 · Activity 2 · Class results</p>
          <h1>Accept or reject?</h1>
          <p>{instructorRunId ? "Instructor view · Updates automatically while this page is open." : "Results are available here in review mode."}</p>
        </header>
        <LiveResults activityKey="assignment-1" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
