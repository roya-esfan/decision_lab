import Link from "next/link";
import { CourseShell } from "./course-shell";
import { isCourseDayPublished } from "@/lib/course-day-access";
import { getInstructor } from "@/lib/instructor-session";
import styles from "../course.module.css";

export async function DayAccessGate({
  dayNumber,
  children,
}: {
  dayNumber: number;
  children: React.ReactNode;
}) {
  const [published, instructor] = await Promise.all([
    isCourseDayPublished(dayNumber),
    getInstructor(),
  ]);

  if (published || instructor) return children;

  return (
    <CourseShell>
      <main className={styles.lockedDayPage}>
        <p className={styles.eyebrow}>Day {dayNumber}</p>
        <h1>This teaching day is not open yet</h1>
        <p>The material will become available when the instructor opens the day.</p>
        <Link href="/">Return to course overview</Link>
      </main>
    </CourseShell>
  );
}
