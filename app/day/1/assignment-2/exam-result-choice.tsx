"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../../../course.module.css";

const results = ["70/100", "96/137"] as const;

export function ExamResultChoice() {
  const [choice, setChoice] = useState<(typeof results)[number] | null>(null);

  function choose(result: (typeof results)[number]) {
    window.localStorage.setItem("decision-lab:day1:exam-result", result);
    setChoice(result);
  }

  if (choice) {
    return (
      <section className={styles.choiceComplete} aria-live="polite">
        <p className={styles.eyebrow}>Response complete</p>
        <h2>Thank you.</h2>
        <p>You chose <strong>{choice}</strong>.</p>
        <div className={styles.resultActions}>
          <Link href="/day/1/assignment-2/results">Class results when revealed</Link>
          <button type="button" onClick={() => setChoice(null)}>Change answer</button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.examChoice} aria-label="Choose one exam result">
      {results.map((result) => (
        <button type="button" key={result} onClick={() => choose(result)}>{result}</button>
      ))}
    </section>
  );
}
