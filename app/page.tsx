import { CourseShell } from "./components/course-shell";
import { CourseHome } from "./components/course-home";
import { courseDayNumbers, getCourseDayAccess } from "@/lib/course-day-access";
import { getInstructor } from "@/lib/instructor-session";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [access, instructor] = await Promise.all([
    getCourseDayAccess(),
    getInstructor(),
  ]);
  const publishedDays = instructor ? [...courseDayNumbers] : access.publishedDays;

  return (
    <CourseShell>
      <main>
        <section className={styles.hero}>
          <h1>Judgement and decision making in organizations</h1>
        </section>
        <CourseHome publishedDays={publishedDays} instructorView={Boolean(instructor)} />
      </main>
    </CourseShell>
  );
}
