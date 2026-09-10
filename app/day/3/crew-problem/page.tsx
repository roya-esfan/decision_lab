import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { CrewProblemActivity } from "./crew-problem-activity";
import styles from "./crew-problem.module.css";

export const metadata: Metadata = {
  title: "Crew problem — Judgement and Decision Making",
  description: "Choose between two options in a decision problem involving a ship's crew.",
};

export default function CrewProblemPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 1</span>
        </nav>

        <header className={styles.header}>
          <p>Day 3 · Activity 1</p>
          <h1>Crew problem</h1>
          <p>Choose between two options.</p>
        </header>

        <CrewProblemActivity />
      </main>
    </CourseShell>
  );
}
