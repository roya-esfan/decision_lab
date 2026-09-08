import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { CompanyRevenueChoice } from "./company-revenue-choice";
import styles from "../day-two-activities.module.css";

export const metadata: Metadata = {
  title: "Which group had larger sales? — Judgement and Decision Making",
  description: "Compare two groups of companies and judge which had greater combined sales revenue.",
};

export default function CompanyRevenuePage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 2</span>
        </nav>

        <header className={styles.activityHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 2</p>
          <h1>Which group had larger sales?</h1>
          <p>
            The following corporations appeared in the 2003 Fortune 500, which ranked
            United States–based firms according to sales revenue.
          </p>
        </header>

        <CompanyRevenueChoice />
      </main>
    </CourseShell>
  );
}
