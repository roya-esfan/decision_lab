import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { LandDisputeActivity } from "./land-dispute-activity";
import styles from "./land-dispute.module.css";

export const metadata: Metadata = {
  title: "Land dispute — Judgement and Decision Making",
  description: "Consider a settlement from one side of a legal dispute.",
};

export default function LandDisputePage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/4">Day 4</Link><span>/</span><span>Activity 1</span>
        </nav>
        <header className={styles.header}>
          <p>Day 4 · Activity 1</p>
          <h1>Land dispute</h1>
        </header>
        <LandDisputeActivity />
        <p className={styles.sourceNote}>
          Inspired by Rachlinski, J. J. (1996). Gains, losses, and the psychology of litigation. <em>Southern California Law Review, 70</em>(1), 113–186.
        </p>
      </main>
    </CourseShell>
  );
}
