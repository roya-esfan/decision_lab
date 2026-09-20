import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BeerValuationActivity } from "./beer-valuation-activity";
import styles from "../../3/crew-problem/crew-problem.module.css";

export const metadata: Metadata = {
  title: "What price would you pay? — Decision-Making Processes in Organizations",
  description: "State the price you would be willing to pay for a beer.",
};

export default function BeerValuationPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 7</span>
        </nav>
        <header className={styles.header}>
          <p>Day 2 · Activity 7</p>
          <h1>What price would you pay?</h1>
        </header>
        <BeerValuationActivity />
      </main>
    </CourseShell>
  );
}
