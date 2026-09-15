import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { CauseRankingActivity } from "./cause-ranking-activity";
import styles from "../day-two-activities.module.css";

export const metadata: Metadata = {
  title: "Rank the causes of death — Judgement and Decision Making",
  description: "Rank five estimated causes of death in the United States.",
};

export default function CausesOfDeathPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 3</span>
        </nav>

        <header className={styles.activityHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 3</p>
          <h1>Rank the causes of death</h1>
          <p>
            Rank these five estimated causes of death in the United States in 2000.
            Place the highest estimated number of deaths first.
          </p>
        </header>

        <CauseRankingActivity />
      </main>
    </CourseShell>
  );
}
