"use client";

import { useRef, useState } from "react";
import {
  encodeEndowmentFramingResponse,
  endowmentFramingConditions,
  type EndowmentFramingConditionNumber,
  type EndowmentFramingDecision,
} from "@/lib/endowment-framing";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import styles from "../crew-problem/crew-problem.module.css";

const problems: Record<EndowmentFramingConditionNumber, {
  startingAmount: string;
  options: Array<{
    decision: EndowmentFramingDecision;
    label: string;
    description: string;
  }>;
}> = {
  "1": {
    startingAmount: "$1,000",
    options: [
      { decision: "certain", label: "Option A", description: "A sure gain of $500" },
      {
        decision: "gamble",
        label: "Option B",
        description: "50% chance to win $1,000, and 50% chance to win nothing",
      },
    ],
  },
  "2": {
    startingAmount: "$2,000",
    options: [
      { decision: "certain", label: "Option A", description: "A sure loss of $500" },
      {
        decision: "gamble",
        label: "Option B",
        description: "50% chance to lose $1,000, and 50% chance to lose nothing",
      },
    ],
  },
};

export function EndowmentFramingActivity() {
  const session = useLiveSession("endowment-framing");
  const idempotencyKey = useRef<string | null>(null);
  const [conditionNumber, setConditionNumber] = useState<EndowmentFramingConditionNumber | null>(null);
  const [choice, setChoice] = useState<EndowmentFramingDecision | null>(null);
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

  const problem = problems[conditionNumber];

  async function choose(decision: EndowmentFramingDecision) {
    if (!conditionNumber) return;
    if (session.state === "review") {
      setChoice(decision);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/endowment-framing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{
            promptKey: "endowment-framing-choice",
            choice: encodeEndowmentFramingResponse(
              endowmentFramingConditions[conditionNumber],
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
    const selected = problem.options.find((option) => option.decision === choice);
    return (
      <section className={styles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>{session.state === "review" ? `You chose ${selected?.label}` : "Thank you"}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="endowment-framing" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="framing-question">
      <div className={styles.scenario}>
        <p>
          <strong>Problem {conditionNumber}</strong><br />
          You are given <strong>{problem.startingAmount}</strong>. Then choose between:
        </p>
        <h2 id="framing-question">Which option would you choose?</h2>
      </div>

      <div className={styles.options} role="group" aria-label="Choose one option">
        {problem.options.map((option) => (
          <button
            type="button"
            disabled={submitting}
            key={option.decision}
            onClick={() => void choose(option.decision)}
          >
            <span>{option.label}</span>
            <strong>{option.description}</strong>
          </button>
        ))}
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
