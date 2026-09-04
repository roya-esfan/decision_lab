import Link from "next/link";
import styles from "../course.module.css";

export function CourseHeader() {
  return (
    <header className={styles.siteHeader}>
      <Link className={styles.wordmark} href="/" aria-label="ØAADM3700 course home">
        <strong>ØAADM3700</strong>
      </Link>
      <span className={styles.headerTerm}>Autumn 2026</span>
    </header>
  );
}

export function CourseFooter() {
  return (
    <footer className={styles.siteFooter}>
      <span>ØAADM3700 · Judgement and decision making in organizations</span>
      <div><Link href="/instructor">Instructor</Link><span>Autumn 2026</span></div>
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
