import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { PrivateActivityAccess } from "../../../components/live-session";
import { RationalDecisionTool } from "./rational-decision-tool";
import styles from "../../../course.module.css";

export default function RationalDecisionAssignmentPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/1">Day 1</Link><span>/</span><span>Activity 5</span>
        </nav>

        <header className={styles.learningActivityHeader}>
          <p className={styles.eyebrow}>Day 1 · Activity 5</p>
          <h1>Make a rational decision</h1>
          <div className={styles.activityBrief}>
            <p>
              Follow six steps while applying a rational decision-making
              process to a problem of your own.
            </p>
            <p className={styles.localNotice}>
              Your problem, criteria, alternatives and ratings stay in this browser. The instructor sees only an anonymous completion count.
            </p>
          </div>
        </header>

        <PrivateActivityAccess activityKey="rational-decision">
          <RationalDecisionTool />
        </PrivateActivityAccess>
      </main>
    </CourseShell>
  );
}
