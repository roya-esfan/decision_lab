import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../day-two-activities.module.css";

export default async function CompanyRevenueResultsPage({
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
          <Link href="/day/2/company-revenue">Activity 2</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 2 · Class results</p>
          <h1>Which group had larger sales?</h1>
        </header>
        <LiveResults activityKey="company-revenue" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
