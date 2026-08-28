import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../../../course.module.css";

export default async function BargainResultsPage({ searchParams }: { searchParams: Promise<{ projector?: string }> }) {
  const projector = (await searchParams).projector === "1";
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-1">Assignment 01</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Assignment 01 · Projector view</p>
          <h1>Accept or reject?</h1>
          <p>{projector ? "This screen updates automatically when results are revealed." : "Results appear after the instructor reveals them."}</p>
        </header>
        <LiveResults activityKey="assignment-1" projector={projector} />
      </main>
    </CourseShell>
  );
}
