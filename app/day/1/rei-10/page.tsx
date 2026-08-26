import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { ReiQuestionnaire } from "./rei-questionnaire";
import styles from "../../../course.module.css";

export const metadata: Metadata = {
  title: "REI-10 cognitive style check — Decision Lab",
  description: "A private, ten-item reflection on analytical and intuitive thinking preferences.",
};

export default function Rei10Page() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/1">Day 01</Link><span>/</span><span>REI-10</span>
        </nav>
        <header className={styles.activityHeader}>
          <div>
            <p className={styles.eyebrow}>Day 01 · Activity 03 · Individual</p>
            <h1>How do you tend to think?</h1>
          </div>
          <div className={styles.activityIntro}>
            <p>
              The REI-10 examines two independent preferences: engagement with
              analytical thinking and trust in intuitive impressions.
            </p>
            <p className={styles.localNotice}>
              Your answers and result stay in this browser. Nothing is submitted or stored.
            </p>
          </div>
        </header>

        <ReiQuestionnaire />

        <aside className={styles.sourceNote} aria-labelledby="source-title">
          <h2 id="source-title">Source and interpretation</h2>
          <p>
            REI-10 by Epstein, Pacini, Denes-Raj and Heier (1996). Items and the
            reverse-scoring clarification follow Haukioja, Nyquist and Jylkkä
            (2020), Table 2, published under CC BY 4.0. This classroom activity
            is for reflection, not psychological diagnosis.
          </p>
          <div>
            <a href="https://doi.org/10.1037/0022-3514.71.2.390" target="_blank" rel="noreferrer">Original REI study</a>
            <a href="https://doi.org/10.1111/mila.12278" target="_blank" rel="noreferrer">Open-access item source</a>
          </div>
        </aside>
      </main>
    </CourseShell>
  );
}
