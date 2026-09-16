import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../land-dispute.module.css";

export default async function LandDisputeResultsPage({
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
          <Link href="/day/4/land-dispute">Activity 1</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.header}>
          <p>Day 4 · Activity 1 · Class results</p>
          <h1>Land dispute</h1>
        </header>
        <LiveResults activityKey="land-dispute" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
