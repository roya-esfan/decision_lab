import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { RareDiseaseValuationActivity } from "./rare-disease-valuation-activity";
import sharedStyles from "../crew-problem/crew-problem.module.css";

export const metadata: Metadata = {
  title: "What amount would you choose? — Judgement and Decision Making",
  description: "State an amount in response to a hypothetical rare-disease scenario.",
};

export default function RareDiseaseValuationPage() {
  return (
    <CourseShell>
      <main className={sharedStyles.page}>
        <nav className={sharedStyles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/3">Day 3</Link><span>/</span><span>Activity 6</span>
        </nav>

        <header className={sharedStyles.header}>
          <p>Day 3 · Activity 6</p>
          <h1>What amount would you choose?</h1>
        </header>

        <RareDiseaseValuationActivity />
      </main>
    </CourseShell>
  );
}
