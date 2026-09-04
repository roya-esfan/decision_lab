import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BargainActivity } from "./bargain-activity";
import styles from "./bargain.module.css";

export default function BargainAssignmentPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1">← Day 1</Link>
        </nav>

        <header className={styles.header}>
          <p>Day 1 · Activity 2</p>
          <h1>A two-player bargain</h1>
        </header>

        <section className={styles.scenario} aria-label="Activity instructions">
          <div className={styles.scenarioBody}>
            <p>
              Eve receives <strong>100 kr</strong> and decides how to divide it
              between herself and you.
            </p>
            <dl className={styles.outcomes}>
              <div>
                <dt>If you accept</dt>
                <dd>You receive the amount Eve offers, and Eve keeps the rest</dd>
              </div>
              <div>
                <dt>If you reject</dt>
                <dd>Neither of you receives any money</dd>
              </div>
            </dl>
          </div>
        </section>

        <BargainActivity />
      </main>
    </CourseShell>
  );
}
