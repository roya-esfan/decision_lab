import { CourseShell } from "./components/course-shell";
import { CourseHome } from "./components/course-home";
import styles from "./home.module.css";

export default function Home() {
  return (
    <CourseShell>
      <main>
        <section className={styles.hero}>
          <h1>Judgement and decision making in organizations</h1>
        </section>
        <CourseHome />
      </main>
    </CourseShell>
  );
}
