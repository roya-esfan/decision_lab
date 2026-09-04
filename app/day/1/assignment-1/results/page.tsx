import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../bargain.module.css";

export default async function BargainResultsPage({ searchParams }: { searchParams: Promise<{ projector?: string }> }) {
  const projector = (await searchParams).projector === "1";
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-1">← A two-player bargain</Link>
        </nav>
        <header className={styles.resultsHeader}>
          <p>Day 1 · Activity 2 · Class results</p>
          <h1>Accept or reject?</h1>
          <p>{projector ? "This screen updates automatically when results are revealed." : "Results appear after the instructor reveals them."}</p>
        </header>
        <LiveResults activityKey="assignment-1" projector={projector} />
      </main>
    </CourseShell>
  );
}
