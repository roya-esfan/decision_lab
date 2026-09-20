import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BinaryChoiceActivity } from "../../2/binary-choice-activity";
import styles from "../../2/day-two-activities.module.css";

export const metadata: Metadata = {
  title: "Fair or unfair? — Decision-Making Processes in Organizations",
  description: "Rate a store’s pricing decision as fair or unfair.",
};

export default function SnowShovelFairnessPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/6">Day 6</Link><span>/</span><span>Activity 1</span>
        </nav>

        <header className={styles.activityHeader}>
          <p className={styles.eyebrow}>Day 6 · Activity 1</p>
          <h1>Fair or unfair?</h1>
        </header>

        <blockquote className={styles.binaryDescription}>
          A hardware store has been selling snow shovels for $15. The morning after a large snowstorm,
          the store raises the price to $20.
        </blockquote>

        <BinaryChoiceActivity
          activityKey="snow-shovel-fairness"
          promptKey="snow-shovel-choice"
          question="Would you rate this action as fair or unfair?"
          options={[
            { letter: "A", value: "Fair" },
            { letter: "B", value: "Unfair" },
          ]}
        />
      </main>
    </CourseShell>
  );
}
