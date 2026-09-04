import Link from "next/link";
import { PrivateActivityAccess } from "../../../components/live-session";
import { CourseShell } from "../../../components/course-shell";
import { BingoCard } from "./bingo-card";
import styles from "./life-experience-bingo.module.css";

export default function LifeExperienceBingoPage() {
  return (
    <CourseShell>
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/day/1">← Day 1</Link>
        </nav>

        <header className={styles.header}>
          <p>Day 1 · Activity 1</p>
          <h1>Life experience bingo – Judgement and decision making edition</h1>
        </header>

        <section className={styles.cardSection} aria-labelledby="card-title">
          <h2 id="card-title">Your bingo card</h2>
          <PrivateActivityAccess activityKey="life-experience-bingo">
            <BingoCard />
          </PrivateActivityAccess>
        </section>
      </main>
    </CourseShell>
  );
}
