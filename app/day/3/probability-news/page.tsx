import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { ProbabilityNewsActivity } from "./probability-news-activity";
import styles from "./probability-news.module.css";

export const metadata: Metadata = {
  title: "Is the news equally good? — Judgement and Decision Making",
  description: "Rate four changes in the chance of receiving $1 million.",
};

export default function ProbabilityNewsPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 7</span>
        </nav>

        <header className={styles.header}>
          <p>Day 3 · Activity 7</p>
          <h1>Is the news equally good?</h1>
        </header>

        <ProbabilityNewsActivity />
      </main>
    </CourseShell>
  );
}
