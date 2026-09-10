import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { SchoolBagFramingActivity } from "./school-bag-framing-activity";
import styles from "./school-bag-framing.module.css";

export const metadata: Metadata = {
  title: "Gain or loss? — Judgement and Decision Making",
  description: "Consider whether two ways of presenting a school-bag price feel like a gain or a loss.",
};

export default function SchoolBagFramingPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 2</span>
        </nav>

        <header className={styles.header}>
          <p>Day 3 · Activity 2</p>
          <h1>Gain or loss?</h1>
          <p>Let&apos;s say you are going to buy a school bag.</p>
        </header>

        <SchoolBagFramingActivity />
      </main>
    </CourseShell>
  );
}
