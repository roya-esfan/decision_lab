import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "../../components/course-shell";
import { courseDays, timetableUrl } from "@/content/course";
import styles from "../../course.module.css";

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
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span><span>Day {String(day.number).padStart(2, "0")}</span>
        </nav>

        <header className={styles.dayHeader}>
          <p className={styles.eyebrow}>Teaching day {String(day.number).padStart(2, "0")} · Week {day.week}</p>
          <h1>{day.date}</h1>
          <dl className={styles.dayFacts}>
            <div><dt>Date</dt><dd>{day.date}</dd></div>
            <div><dt>Time</dt><dd>{day.time}</dd></div>
            <div><dt>Room</dt><dd><a href={timetableUrl} target="_blank" rel="noreferrer">{day.room} ↗</a></dd></div>
          </dl>
        </header>

        <section className={styles.dayOverview} aria-labelledby="topics-title">
          <div>
            <p className={styles.sectionLabel}>Day overview</p>
            <h2 id="topics-title">Relevant topics</h2>
          </div>
          <ul className={styles.topicList}>
            {day.topics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </section>

        <section className={styles.readingSection} aria-labelledby="reading-title">
          <div className={styles.sectionTitle}>
            <h2 id="reading-title">Reading list</h2>
            <p>For this teaching day</p>
          </div>
          <div className={styles.readingGroups}>
            {readingGroups.map((group) => (
              <div key={group.label}>
                <h3>{group.label}</h3>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sessionSection} aria-labelledby="session-title">
          <div className={styles.sectionTitle}>
            <h2 id="session-title">Today&apos;s session</h2>
            <p>{day.sessions.length > 0 ? "Lecture blocks and breaks" : "Detailed plan to follow"}</p>
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
              <span>{String(day.number).padStart(2, "0")}</span>
              <p>The detailed 45-minute sessions and breaks will be added here.</p>
            </div>
          )}
        </section>

        <section className={styles.assignmentSection} aria-labelledby="assignments-title">
          <div className={styles.sectionTitle}>
            <h2 id="assignments-title">Assignments</h2>
            <p>{day.assignments.length > 0 ? `${day.assignments.length} prepared` : "Added as the course develops"}</p>
          </div>
          {day.assignments.length > 0 ? (
            <ol className={styles.assignmentList}>
              {day.assignments.map((assignment) => (
                <li key={assignment.number}>
                  <span className={styles.activityNumber}>{String(assignment.number).padStart(2, "0")}</span>
                  <div>
                    <p className={styles.eyebrow}>Assignment {assignment.number}</p>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                  </div>
                  <Link className={styles.primaryLink} href={assignment.href}>Open assignment</Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.planPending}>
              <span>—</span>
              <p>No assignments have been added to this day yet.</p>
            </div>
          )}
        </section>
      </main>
    </CourseShell>
  );
}
