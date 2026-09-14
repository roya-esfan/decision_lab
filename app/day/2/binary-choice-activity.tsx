"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../components/live-session";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import type { ActivityKey } from "@/lib/classroom";
import sharedStyles from "../../course.module.css";
import styles from "./day-two-activities.module.css";

type Option = { letter: "A" | "B"; value: string };

export function BinaryChoiceActivity({
  activityKey,
  promptKey,
  question,
  options,
}: {
  activityKey: ActivityKey;
  promptKey: string;
  question: string;
  options: readonly [Option, Option];
}) {
  const session = useLiveSession(activityKey);
  const idempotencyKey = useRef<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  async function choose(value: string) {
    if (submitting) return;
    if (session.state === "review") {
      setChoice(value);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetchWithTransientRetry(`/api/responses/${activityKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{ promptKey, choice: value }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your response could not be submitted.");
      }
      setChoice(value);
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
      <section className={styles.activityComplete} aria-live="polite">
        <p className={styles.eyebrow}>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>You chose {choice}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey={activityKey} />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.binaryActivity} aria-labelledby="binary-choice-question">
      <h2 id="binary-choice-question">{question}</h2>
      <div className={styles.binaryChoices} role="group" aria-label={question}>
        {options.map((option) => (
          <button key={option.value} type="button" disabled={submitting} onClick={() => void choose(option.value)}>
            <span>{option.letter}</span>
            <strong>{option.value}</strong>
          </button>
        ))}
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
