import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "../../components/course-shell";
import { courseDays } from "@/content/course";
import styles from "./day.module.css";

export function generateStaticParams() {
  return courseDays.map((day) => ({ dayNumber: String(day.number) }));
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  const day = courseDays.find((item) => item.number === Number(dayNumber));

  if (!day) notFound();

  const readingGroups = [
    { label: "Required", items: day.readings.required },
    { label: "Recommended", items: day.readings.recommended },
    { label: "Further reading", items: day.readings.further ?? [] },
  ].filter((group) => group.items.length > 0);

  return (
    <CourseShell>
      <main className={styles.dayPage}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">← Course overview</Link>
        </nav>

        <header className={styles.dayHeader}>
          <div className={styles.dayTitle}>
            <p>Day {day.number} · Week {day.week}</p>
            <h1>{day.title}</h1>
          </div>
          <dl className={styles.dayFacts}>
            <div>
              <dt>Date</dt>
              <dd>{day.date}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{day.time}</dd>
            </div>
            <div>
              <dt>Room</dt>
              <dd>{day.room}</dd>
            </div>
          </dl>
        </header>

        <section className={styles.dayOverview} aria-labelledby="topics-title">
          <div>
            <h2 id="topics-title">This day covers</h2>
          </div>
          <ul>
            {day.topics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </section>

        <section className={styles.sessionSection} aria-labelledby="session-title">
          <div className={styles.sectionHeading}>
            <h2 id="session-title">Today&apos;s plan</h2>
          </div>
          {day.sessions.length > 0 ? (
            <ol className={styles.sessionList}>
              {day.sessions.map((session) => (
                <li className={session.kind === "break" ? styles.breakRow : undefined} key={`${session.time}-${session.label}`}>
                  <time>{session.time}</time>
                  <div>
                    <strong>{session.label}</strong>
                    {session.description && <p>{session.description}</p>}
                  </div>
                  <span>{session.duration}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.planPending}>
              <p>The detailed plan for this teaching day will be added here.</p>
            </div>
          )}
        </section>

        <section className={styles.assignmentSection} aria-labelledby="assignments-title">
          <div className={styles.sectionHeading}>
            <h2 id="assignments-title">Activities</h2>
          </div>
          {day.assignments.length > 0 ? (
            <ol className={styles.assignmentList}>
              {day.assignments.map((assignment) => (
                <li key={assignment.number}>
                  <span className={styles.assignmentNumber}>{assignment.number}</span>
                  <div>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                  </div>
                  {assignment.status === "ready" ? (
                    <Link className={styles.assignmentLink} href={assignment.href}>
                      Open activity <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className={styles.assignmentPending}>Details to follow</span>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.planPending}>
              <p>No assignments have been added to this day yet.</p>
            </div>
          )}
        </section>

        <section className={styles.readingSection} aria-labelledby="reading-title">
          <div className={styles.sectionHeading}>
            <h2 id="reading-title">Reading list</h2>
          </div>
          <div className={styles.readingGroups}>
            {readingGroups.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
            ))}
          </div>
        </section>
      </main>
    </CourseShell>
  );
}
