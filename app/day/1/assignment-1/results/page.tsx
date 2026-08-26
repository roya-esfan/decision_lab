import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import styles from "../../../../course.module.css";

const offers = [
  { offered: 50, kept: 50 },
  { offered: 20, kept: 80 },
  { offered: 2, kept: 98 },
];

export default function BargainResultsPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-1">Assignment 01</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Assignment 01 · Projector view</p>
          <h1>Accept or reject?</h1>
          <p>Class results remain hidden until the instructor reveals them.</p>
        </header>

        <section className={styles.hiddenResults} aria-label="Hidden class results">
          {offers.map((offer, index) => (
            <div key={offer.offered}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{offer.offered} kr to you / {offer.kept} kr to Eve</strong>
              <div aria-hidden="true"><i /><i /></div>
              <em>Waiting for reveal</em>
            </div>
          ))}
        </section>

        <p className={styles.resultsStatus}>
          This is the slide-ready results address. Live counts and reveal
          controls will appear here after Supabase is connected.
        </p>
      </main>
    </CourseShell>
  );
}
