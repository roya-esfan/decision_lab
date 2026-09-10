import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { EndowmentFramingActivity } from "./endowment-framing-activity";
import styles from "../crew-problem/crew-problem.module.css";

export const metadata: Metadata = {
  title: "Choose between two options — Judgement and Decision Making",
  description: "Choose between a certain outcome and a gamble.",
};

export default function EndowmentFramingPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 4</span>
        </nav>

        <header className={styles.header}>
          <p>Day 3 · Activity 4</p>
          <h1>Choose between two options</h1>
        </header>

        <EndowmentFramingActivity />
      </main>
    </CourseShell>
  );
}
