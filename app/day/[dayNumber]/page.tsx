import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "../../components/course-shell";
import { courseDays } from "@/content/course";
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

  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span><span>Day {String(day.number).padStart(2, "0")}</span>
        </nav>
        <header className={styles.dayHeader}>
          <p className={styles.eyebrow}>Teaching day {String(day.number).padStart(2, "0")}</p>
          <h1>{day.number === 1 ? "Activities for the first day" : "This day is being prepared"}</h1>
          <p>{day.description}</p>
        </header>

        {day.number === 1 ? (
          <section className={styles.activityList} aria-labelledby="activities-title">
            <div className={styles.sectionTitle}>
              <h2 id="activities-title">Activities</h2>
              <p>1 ready · numbering can change</p>
            </div>
            <article>
              <span className={styles.activityNumber}>03</span>
              <div>
                <p className={styles.eyebrow}>Individual · approximately 3 minutes</p>
                <h3>REI-10 cognitive style check</h3>
                <p>Examine two independent preferences: analytical engagement and intuitive trust.</p>
              </div>
              <Link className={styles.primaryLink} href="/day/1/rei-10">Start activity</Link>
            </article>
          </section>
        ) : (
          <section className={styles.emptyDay}>
            <span>{String(day.number).padStart(2, "0")}</span>
            <p>No activities have been assigned to this day yet.</p>
            <Link href="/">Return to the course map</Link>
          </section>
        )}
      </main>
    </CourseShell>
  );
}
