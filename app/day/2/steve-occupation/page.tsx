import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BinaryChoiceActivity } from "../binary-choice-activity";
import styles from "../day-two-activities.module.css";

export const metadata: Metadata = {
  title: "Steve’s occupation — Decision-Making Processes in Organizations",
  description: "Read a short description and choose which occupation Steve is most likely to have.",
};

export default function SteveOccupationPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 3</span>
        </nav>

        <header className={styles.activityHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 3</p>
          <h1>Steve’s occupation</h1>
        </header>

        <blockquote className={styles.binaryDescription}>
          Steve is very shy and withdrawn, invariably helpful, but with little interest in people,
          or in the world of reality. A meek and tidy soul, he has a need for order and structure,
          and a passion for detail.
        </blockquote>

        <BinaryChoiceActivity
          activityKey="steve-occupation"
          promptKey="steve-occupation-choice"
          question="Which occupation is Steve most likely to have?"
          options={[{ letter: "A", value: "Farmer" }, { letter: "B", value: "Librarian" }]}
        />
      </main>
    </CourseShell>
  );
}
