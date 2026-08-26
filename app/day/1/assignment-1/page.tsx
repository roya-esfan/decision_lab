import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BargainActivity } from "./bargain-activity";
import styles from "../../../course.module.css";

export default function BargainAssignmentPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/1">Day 01</Link><span>/</span><span>Assignment 01</span>
        </nav>

        <header className={styles.activityHeader}>
          <div>
            <p className={styles.eyebrow}>Day 01 · Assignment 01</p>
            <h1>A two-player bargain</h1>
          </div>
          <div className={styles.activityIntro}>
            <p>
              You are Player 2, the responder. Player 1, Eve, receives 100 kr
              and decides how to divide it between herself and you. You do not
              know each other.
            </p>
            <p className={styles.localNotice}>
              If you accept, each player receives the proposed amount. If you
              reject, neither player receives anything.
            </p>
          </div>
        </header>

        <BargainActivity />
      </main>
    </CourseShell>
  );
}
