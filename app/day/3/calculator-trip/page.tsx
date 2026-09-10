import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { CalculatorTripActivity } from "./calculator-trip-activity";
import styles from "../crew-problem/crew-problem.module.css";

export const metadata: Metadata = {
  title: "Would you make the trip? — Judgement and Decision Making",
  description: "Decide whether you would travel to another store to save five dollars.",
};

export default function CalculatorTripPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 3</span>
        </nav>

        <header className={styles.header}>
          <p>Day 3 · Activity 3</p>
          <h1>Would you make the trip?</h1>
        </header>

        <CalculatorTripActivity />
      </main>
    </CourseShell>
  );
}
