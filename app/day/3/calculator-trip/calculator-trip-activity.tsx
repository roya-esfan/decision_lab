"use client";

import { useRef, useState } from "react";
import {
  calculatorTripConditions,
  encodeCalculatorTripResponse,
  type CalculatorTripConditionNumber,
  type CalculatorTripDecision,
} from "@/lib/calculator-trip";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import styles from "../crew-problem/crew-problem.module.css";

const scenarios: Record<CalculatorTripConditionNumber, string> = {
  "1": "Imagine that you are about to purchase a jacket for $125 and a calculator for $15. The calculator salesperson informs you that the calculator you wish to buy is on sale for $10 at another branch of the store, located a 20-minute drive away.",
  "2": "Imagine that you are about to purchase a jacket for $15 and a calculator for $125. The calculator salesperson informs you that the calculator you wish to buy is on sale for $120 at another branch of the store, located a 20-minute drive away.",
};

export function CalculatorTripActivity() {
  const session = useLiveSession("calculator-trip");
  const idempotencyKey = useRef<string | null>(null);
  const [conditionNumber, setConditionNumber] = useState<CalculatorTripConditionNumber | null>(null);
  const [choice, setChoice] = useState<CalculatorTripDecision | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (!conditionNumber) {
    return (
      <section className={styles.conditionPicker} aria-labelledby="condition-title">
        <h2 id="condition-title">Choose the number assigned to you</h2>
        <div role="group" aria-label="Choose number 1 or 2">
          <button type="button" onClick={() => setConditionNumber("1")}>1</button>
          <button type="button" onClick={() => setConditionNumber("2")}>2</button>
        </div>
      </section>
    );
  }

  async function choose(decision: CalculatorTripDecision) {
    if (!conditionNumber) return;
    if (session.state === "review") {
      setChoice(decision);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/calculator-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{
            promptKey: "calculator-trip-choice",
            choice: encodeCalculatorTripResponse(
              calculatorTripConditions[conditionNumber],
              decision,
            ),
          }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your response could not be submitted.");
      }
      setChoice(decision);
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
        <h2>{session.state === "review" ? `You chose ${choice === "yes" ? "Yes" : "No"}` : "Thank you"}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="calculator-trip" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="trip-question">
      <div className={styles.scenario}>
        <p>{scenarios[conditionNumber]}</p>
        <h2 id="trip-question">Would you make the trip to the other store?</h2>
      </div>

      <div className={styles.options} role="group" aria-label="Choose yes or no">
        {(["yes", "no"] as const).map((decision) => (
          <button
            type="button"
            disabled={submitting}
            key={decision}
            onClick={() => void choose(decision)}
          >
            <span>Your answer</span>
            <strong>{decision === "yes" ? "Yes" : "No"}</strong>
          </button>
        ))}
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
