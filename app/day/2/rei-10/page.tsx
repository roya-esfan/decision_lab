import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { PrivateActivityAccess } from "../../../components/live-session";
import { ReiQuestionnaire } from "../../../components/rei-questionnaire";
import styles from "../../../course.module.css";

export const metadata: Metadata = {
  title: "REI-10 cognitive style check — Judgement and Decision Making",
  description: "A private, ten-item reflection on analytical and intuitive thinking preferences.",
};

export default function Rei10Page() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/2">Day 2</Link><span>/</span><span>Activity 1</span>
        </nav>
        <header className={styles.learningActivityHeader}>
          <p className={styles.eyebrow}>Day 2 · Activity 1 · Individual</p>
          <h1>How do you tend to think?</h1>
        </header>

        <section className={styles.reiMeasure} aria-labelledby="rei-measure-title">
          <h2 id="rei-measure-title">What does the REI measure?</h2>
          <div>
            <p>
              Epstein and colleagues (1996) proposed two independent thinking styles: an analytic-rational mode and an intuitive-experiential mode. In their theory, rational processing is relatively conscious, intentional, analytic and rule-based, whereas experiential processing is more automatic, holistic, associative and closely connected to feelings and past experience. The REI measures people&apos;s self-reported tendency or preference to rely on these modes, rather than their intelligence or ability.
            </p>
            <p>
              Their original measure, REI-40, consists of 40 items. This is a short version, REI-10, with 10 items.
            </p>
            <p className={styles.localNotice}>
              Your answers and scores stay in this browser. The instructor sees only an anonymous completion count.
            </p>
          </div>
        </section>

        <PrivateActivityAccess activityKey="rei-10">
          <ReiQuestionnaire />
        </PrivateActivityAccess>

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
