import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { EvaluateDecisionActivity } from "./evaluate-decision-activity";
import styles from "./evaluate-decision.module.css";

export default function EvaluateDecisionPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1">← Day 1</Link>
        </nav>
        <header className={styles.header}>
          <p>Day 1 · Activity 3</p>
          <h1>Evaluate the decision</h1>
          <p>Consider three decisions made under uncertainty and rate the quality of each decision.</p>
        </header>
        <EvaluateDecisionActivity />
      </main>
    </CourseShell>
  );
}
