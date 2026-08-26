import { CourseShell } from "./components/course-shell";
import { CourseHome } from "./components/course-home";
import styles from "./course.module.css";

export default function Home() {
  return (
    <CourseShell>
      <main>
        <section className={styles.hero}>
          <p className={styles.courseCode}>ØAADM3700</p>
          <h1>Decision-Making Processes<br />in Organizations</h1>
          <p className={styles.term}>Autumn 2026</p>
        </section>
        <CourseHome />
      </main>
    </CourseShell>
  );
}
