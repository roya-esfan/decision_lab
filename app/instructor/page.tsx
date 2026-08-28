import { CourseShell } from "../components/course-shell";
import { getInstructor } from "@/lib/instructor-session";
import { InstructorLogin } from "./instructor-login";
import { ControlRoom } from "./control-room";
import styles from "../course.module.css";

export const dynamic = "force-dynamic";

export default async function InstructorPage() {
  const instructor = await getInstructor();
  return (
    <CourseShell>
      <main>
        <header className={styles.instructorHeader}>
          <p className={styles.eyebrow}>Instructor only</p>
          <h1>Classroom control</h1>
          <p>Start a session, preview anonymous response totals and decide when the class sees the results.</p>
        </header>
        {instructor ? <ControlRoom email={instructor.email} /> : <InstructorLogin />}
      </main>
    </CourseShell>
  );
}
