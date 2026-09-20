import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../../2/day-two-activities.module.css";

export default async function SnowShovelFairnessResultsPage({
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
          <Link href="/day/6/snow-shovel-fairness">Activity 1</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Day 6 · Activity 1 · Class results</p>
          <h1>Fair or unfair?</h1>
        </header>
        <LiveResults activityKey="snow-shovel-fairness" projector={projector} instructorRunId={instructorRunId} />
      </main>
    </CourseShell>
  );
}
