import Link from "next/link";
import { CourseShell } from "../../../../components/course-shell";
import styles from "../../../../course.module.css";

export default function ExamResultResultsPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1/assignment-2">Assignment 02</Link><span>/</span><span>Class results</span>
        </nav>
        <header className={styles.resultsHeader}>
          <p className={styles.eyebrow}>Assignment 02 · Projector view</p>
          <h1>Which result felt better?</h1>
          <p>Class results remain hidden until the instructor reveals them.</p>
        </header>

        <section className={styles.choiceResults} aria-label="Hidden class results">
          {['70/100', '96/137'].map((result, index) => (
            <div key={result}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{result}</strong>
              <div aria-hidden="true" />
              <em>Waiting for reveal</em>
            </div>
          ))}
        </section>
      </main>
    </CourseShell>
  );
}
