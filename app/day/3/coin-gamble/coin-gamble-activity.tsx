"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import styles from "../crew-problem/crew-problem.module.css";

type Choice = "Yes" | "No";

export function CoinGambleActivity() {
  const session = useLiveSession("coin-gamble");
  const idempotencyKey = useRef<string | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  async function choose(answer: Choice) {
    if (session.state === "review") {
      setChoice(answer);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/coin-gamble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{ promptKey: "coin-gamble-choice", choice: answer }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your response could not be submitted.");
      }
      setChoice(answer);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your response could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (choice) {
    return (
      <section className={styles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>{session.state === "review" ? `You chose ${choice}` : "Thank you"}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="coin-gamble" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="gamble-question">
      <div className={styles.scenario}>
        <p>
          You are offered a gamble on the toss of a coin.<br />
          If the coin shows tails, you lose <strong>$100</strong>.<br />
          If the coin shows heads, you win <strong>$150</strong>.
        </p>
        <h2 id="gamble-question">Is this gamble attractive? Would you accept it?</h2>
      </div>

      <div className={styles.options} role="group" aria-label="Choose yes or no">
        {(["Yes", "No"] as const).map((answer) => (
          <button
            type="button"
            disabled={submitting}
            key={answer}
            onClick={() => void choose(answer)}
          >
            <span>Your answer</span>
            <strong>{answer}</strong>
          </button>
        ))}
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
