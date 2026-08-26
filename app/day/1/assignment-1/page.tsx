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
              Imagine a bargain between you and Eve. You do not know one
              another. Eve receives 100 kr and proposes how much to give you
              and how much to keep for herself.
            </p>
            <p className={styles.localNotice}>
              You decide whether to accept or reject each offer. Accepting means
              the money is divided exactly as Eve proposes. Rejecting means
              both of you receive 0 kr.
            </p>
          </div>
        </header>

        <BargainActivity />
      </main>
    </CourseShell>
  );
}
