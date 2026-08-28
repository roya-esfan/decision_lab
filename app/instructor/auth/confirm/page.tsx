import { CourseShell } from "../../../components/course-shell";
import { MagicLinkConfirmation } from "./magic-link-confirmation";
import styles from "../../../course.module.css";

export default function InstructorAuthConfirmPage() {
  return (
    <CourseShell>
      <main>
        <header className={styles.instructorHeader}>
          <p className={styles.eyebrow}>Instructor only</p>
          <h1>Confirming sign-in</h1>
        </header>
        <MagicLinkConfirmation />
      </main>
    </CourseShell>
  );
}
