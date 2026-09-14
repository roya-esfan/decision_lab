"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import sharedStyles from "../../../course.module.css";
import styles from "../day-two-activities.module.css";

type Occupation = "Farmer" | "Librarian";

export function SteveOccupationChoice() {
  const session = useLiveSession("steve-occupation");
  const idempotencyKey = useRef<string | null>(null);
  const [choice, setChoice] = useState<Occupation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  async function choose(occupation: Occupation) {
    if (submitting) return;
    if (session.state === "review") {
      setChoice(occupation);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetchWithTransientRetry("/api/responses/steve-occupation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{ promptKey: "steve-occupation-choice", choice: occupation }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your response could not be submitted.");
      }
      setChoice(occupation);
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
            <LiveResults activityKey="steve-occupation" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.steveActivity} aria-labelledby="steve-question">
      <h2 id="steve-question">Which occupation is Steve most likely to have?</h2>
      <div className={styles.steveChoices} role="group" aria-label="Choose Steve’s occupation">
        {(["Farmer", "Librarian"] as const).map((occupation, index) => (
          <button key={occupation} type="button" disabled={submitting} onClick={() => void choose(occupation)}>
            <span>{index === 0 ? "A" : "B"}</span>
            <strong>{occupation}</strong>
          </button>
        ))}
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
