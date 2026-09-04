import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { ExamResultChoice } from "./exam-result-choice";
import styles from "../../../course.module.css";

export default function ExamResultAssignmentPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/1">Day 1</Link><span>/</span><span>Activity 4</span>
        </nav>

        <header className={styles.singlePromptHeader}>
          <p className={styles.eyebrow}>Day 1 · Activity 4</p>
          <h1>You just got your results back after a challenging exam.</h1>
          <p>Which exam result would you feel happier receiving? Answer based on your immediate reaction.</p>
        </header>

        <ExamResultChoice />
      </main>
    </CourseShell>
  );
}
