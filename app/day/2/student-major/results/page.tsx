import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../day-two-activities.module.css";

export default async function StudentMajorResultsPage({
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
          <Link href="/day/2/student-major">Activity 5</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 5 · Class results</p>
          <h1>The student’s major</h1>
        </header>
        <LiveResults activityKey="student-major" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
