import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { WageFairnessActivity } from "./wage-fairness-activity";
import styles from "../../3/crew-problem/crew-problem.module.css";

export const metadata: Metadata = {
  title: "Fair or unfair? — Decision-Making Processes in Organizations",
  description: "Rate a company’s decision about wages and salaries.",
};

export default function WageFairnessPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 6</span>
        </nav>
        <header className={styles.header}>
          <p>Day 2 · Activity 6</p>
          <h1>Fair or unfair?</h1>
          <p>Rate the company’s action.</p>
        </header>
        <WageFairnessActivity />
      </main>
    </CourseShell>
  );
}
