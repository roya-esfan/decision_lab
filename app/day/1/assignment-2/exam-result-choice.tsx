"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import styles from "../../../course.module.css";

const results = ["70/100", "96/137"] as const;

export function ExamResultChoice() {
  const session = useLiveSession("assignment-2");
  const idempotencyKey = useRef<string | null>(null);
  const [choice, setChoice] = useState<(typeof results)[number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  async function choose(result: (typeof results)[number]) {
    if (session.state === "review") {
      setChoice(result);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/assignment-2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{ promptKey: "exam-result", choice: result }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) throw new Error(data.error ?? "Your response could not be submitted.");
      setChoice(result);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your response could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (choice) {
    return (
      <section className={styles.choiceComplete} aria-live="polite">
        <p className={styles.eyebrow}>Response complete</p>
        <h2>Thank you.</h2>
        <p>
          You chose <strong>{choice}</strong>.
          {session.state === "review" && " This practice response was not added to the class results."}
        </p>
        {session.state === "review" ? (
          <div className={styles.reviewResults}>
            <header>
              <p className={styles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="assignment-2" />
          </div>
        ) : (
          <p className={styles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <>
      <section className={styles.examChoice} aria-label="Choose one exam result">
        {results.map((result) => (
          <button type="button" disabled={submitting} key={result} onClick={() => void choose(result)}>{result}</button>
        ))}
      </section>
      {submitting && <p className={styles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={styles.formError} role="alert">{submissionError}</p>}
    </>
  );
}
