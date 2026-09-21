import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { ConfidenceIntervalActivity } from "./confidence-interval-activity";
import styles from "./confidence-intervals.module.css";

export const metadata: Metadata = {
  title: "90% confidence intervals — Decision-Making Processes in Organizations",
  description: "Give minimum and maximum estimates for ten questions.",
};

export default function ConfidenceIntervalsPage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/5">Day 5</Link><span>/</span><span>Activity 1</span>
        </nav>
        <header className={styles.activityHeader}>
          <p>Day 5 · Activity 1</p>
          <h1>90% confidence intervals</h1>
        </header>
        <ConfidenceIntervalActivity />
      </main>
    </CourseShell>
  );
}
