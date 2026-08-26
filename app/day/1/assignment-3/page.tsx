import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { RationalDecisionTool } from "./rational-decision-tool";
import styles from "../../../course.module.css";

export default function RationalDecisionAssignmentPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/1">Day 01</Link><span>/</span><span>Assignment 03</span>
        </nav>

        <header className={styles.activityHeader}>
          <div>
            <p className={styles.eyebrow}>Day 01 · Assignment 03</p>
            <h1>Build a rational decision</h1>
          </div>
          <div className={styles.activityIntro}>
            <p>
              Follow six steps while applying a rational decision-making
              process to a problem of your own.
            </p>
            <p className={styles.localNotice}>
              Your problem, criteria, alternatives and ratings stay in this browser.
            </p>
          </div>
        </header>

        <RationalDecisionTool />
      </main>
    </CourseShell>
  );
}
