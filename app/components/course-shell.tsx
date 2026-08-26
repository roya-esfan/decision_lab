import Link from "next/link";
import styles from "../course.module.css";

export function CourseHeader() {
  return (
    <header className={styles.siteHeader}>
      <Link className={styles.wordmark} href="/" aria-label="Decision Lab home">
        <span>DL</span>
        <strong>Decision Lab</strong>
      </Link>
      <div className={styles.courseMark}>
        <span>ØAADM3700</span>
        <span>Independent teaching project</span>
      </div>
    </header>
  );
}

export function CourseFooter() {
  return (
    <footer className={styles.siteFooter}>
      <span>ØAADM3700 · Decision-Making Processes in Organizations</span>
      <span>Not an official OsloMet service</span>
    </footer>
  );
}

export function CourseShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <CourseHeader />
      {children}
      <CourseFooter />
    </div>
  );
}
