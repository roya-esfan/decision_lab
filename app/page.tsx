import Link from "next/link";
import { CourseShell } from "./components/course-shell";
import { courseDays } from "@/content/course";
import styles from "./course.module.css";

export default function Home() {
  return (
    <CourseShell>
      <main>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Course workspace · Autumn 2026</p>
            <h1>Decision-Making Processes<br />in Organizations</h1>
          </div>
          <div className={styles.heroAside}>
            <p>
              Experiments, cases and practical tools for examining how decisions
              are made—and how they can be improved.
            </p>
            <dl>
              <div><dt>Format</dt><dd>6 teaching days</dd></div>
              <div><dt>Activities</dt><dd>Built throughout the course</dd></div>
            </dl>
          </div>
        </section>

        <section className={styles.readyActivity} aria-labelledby="ready-title">
          <div className={styles.sectionIndex}>D1 / A03</div>
          <div>
            <p className={styles.eyebrow}>Ready for Day 01 · Individual reflection</p>
            <h2 id="ready-title">How do you tend to think?</h2>
            <p>
              Take the ten-item Rational–Experiential Inventory and reflect on
              your preference for analytical thinking and intuitive judgment.
            </p>
          </div>
          <div className={styles.activityAction}>
            <span>Approximately 3 minutes</span>
            <Link className={styles.primaryLink} href="/day/1/rei-10">Start REI-10</Link>
          </div>
        </section>

        <section className={styles.courseMap} aria-labelledby="course-map-title">
          <div className={styles.sectionTitle}>
            <h2 id="course-map-title">Course map</h2>
            <p>Six teaching days · ten sessions</p>
          </div>
          <ol className={styles.dayList}>
            {courseDays.map((day) => (
              <li key={day.number}>
                <span className={styles.dayNumber}>{String(day.number).padStart(2, "0")}</span>
                <div>
                  <strong>{day.label}</strong>
                  <span>{day.description}</span>
                </div>
                <span>{day.sessionCount} {day.sessionCount === 1 ? "session" : "sessions"}</span>
                <Link href={`/day/${day.number}`}>
                  {day.status === "ready" ? "Open day" : "View placeholder"}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </CourseShell>
  );
}
