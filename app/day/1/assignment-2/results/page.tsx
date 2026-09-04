import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../../../course.module.css";

export default async function ExamResultResultsPage({ searchParams }: { searchParams: Promise<{ projector?: string; instructor?: string; run?: string }> }) {
  const params = await searchParams;
  const projector = params.projector === "1";
  const instructorRunId = params.instructor === "1" ? params.run : undefined;
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-2">Assignment 02</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Day 1 · Activity 3 · Class results</p>
          <h1>Which result felt better?</h1>
          <p>{instructorRunId ? "Instructor view · Updates automatically while this page is open." : "Results are available here in review mode."}</p>
        </header>
        <LiveResults activityKey="assignment-2" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
