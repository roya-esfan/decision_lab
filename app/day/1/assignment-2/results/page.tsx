import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import { LiveResults } from "../../../../components/live-results";
import styles from "../../../../course.module.css";

export default async function ExamResultResultsPage({ searchParams }: { searchParams: Promise<{ projector?: string }> }) {
  const projector = (await searchParams).projector === "1";
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-2">Assignment 02</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Assignment 02 · Projector view</p>
          <h1>Which result felt better?</h1>
          <p>{projector ? "This screen updates automatically when results are revealed." : "Results appear after the instructor reveals them."}</p>
        </header>
        <LiveResults activityKey="assignment-2" projector={projector} />
      </main>
    </CourseShell>
  );
}
