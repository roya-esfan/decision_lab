import { CourseShell } from "./components/course-shell";
import { CourseHome } from "./components/course-home";
import { getCourseDayAccess } from "@/lib/course-day-access";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const access = await getCourseDayAccess();
  return (
    <CourseShell>
      <main>
        <section className={styles.hero}>
          <h1>Judgement and decision making in organizations</h1>
        </section>
        <CourseHome publishedDays={access.publishedDays} />
      </main>
    </CourseShell>
  );
}
