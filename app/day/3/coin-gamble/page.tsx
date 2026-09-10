import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { CoinGambleActivity } from "./coin-gamble-activity";
import styles from "../crew-problem/crew-problem.module.css";

export const metadata: Metadata = {
  title: "Would you accept the gamble? — Judgement and Decision Making",
  description: "Consider a coin-toss gamble and decide whether to accept it.",
};

export default function CoinGamblePage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 5</span>
        </nav>

        <header className={styles.header}>
          <p>Day 3 · Activity 5</p>
          <h1>Would you accept the gamble?</h1>
        </header>

        <CoinGambleActivity />
      </main>
    </CourseShell>
  );
}
