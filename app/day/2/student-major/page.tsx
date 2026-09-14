import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BinaryChoiceActivity } from "../binary-choice-activity";
import styles from "../day-two-activities.module.css";

export const metadata: Metadata = {
  title: "The student’s major — Decision-Making Processes in Organizations",
  description: "Read a short description and guess a student’s undergraduate major.",
};

export default function StudentMajorPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 5</span>
        </nav>

        <header className={styles.activityHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 5</p>
          <h1>The student’s major</h1>
        </header>

        <blockquote className={styles.binaryDescription}>
          The best student in my class in Norway used to write poetry and is rather shy and small in size.
          Do your best to guess.
        </blockquote>

        <BinaryChoiceActivity
          activityKey="student-major"
          promptKey="student-major-choice"
          question="What was the student’s undergraduate major?"
          options={[{ letter: "A", value: "Chinese studies" }, { letter: "B", value: "Economics" }]}
        />
      </main>
    </CourseShell>
  );
}
