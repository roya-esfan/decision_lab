import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../probability-news.module.css";

export default async function ProbabilityNewsResultsPage({
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
          <Link href="/day/3/probability-news">Activity 7</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.header}>
          <p>Day 3 · Activity 7 · Class results</p>
          <h1>Is the news equally good?</h1>
        </header>
        <LiveResults activityKey="probability-news" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
