"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import {
  crewProblemConditions,
  encodeCrewProblemResponse,
  type CrewProblemConditionNumber,
  type CrewProblemDecision,
} from "@/lib/crew-problem";
import sharedStyles from "../../../course.module.css";
import styles from "./crew-problem.module.css";

const options: Record<CrewProblemConditionNumber, Array<{
  decision: CrewProblemDecision;
  label: string;
  description: string;
}>> = {
  "1": [
    {
      decision: "certain",
      label: "Option A",
      description: "200 crew members will be saved for sure.",
    },
    {
      decision: "uncertain",
      label: "Option B",
      description: "There is a 1/3 chance that all 600 crew members will be saved, and a 2/3 chance that nobody will be saved.",
    },
  ],
  "2": [
    {
      decision: "certain",
      label: "Option A",
      description: "400 crew members will die for sure.",
    },
    {
      decision: "uncertain",
      label: "Option B",
      description: "There is a 1/3 chance that nobody will die, and a 2/3 chance that all 600 crew members will die.",
    },
  ],
};

export function CrewProblemActivity() {
  const session = useLiveSession("crew-problem");
  const idempotencyKey = useRef<string | null>(null);
  const [conditionNumber, setConditionNumber] = useState<CrewProblemConditionNumber | null>(null);
  const [choice, setChoice] = useState<CrewProblemDecision | null>(null);
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

  const selectedOptions = options[conditionNumber];

  async function choose(decision: CrewProblemDecision) {
    if (!conditionNumber) return;
    if (session.state === "review") {
      setChoice(decision);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/crew-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{
            promptKey: "crew-choice",
            choice: encodeCrewProblemResponse(crewProblemConditions[conditionNumber], decision),
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
    const selected = selectedOptions.find((option) => option.decision === choice);
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
            <LiveResults activityKey="crew-problem" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="crew-question">
      <div className={styles.scenario}>
        <p>
          A ship hit a water mine in the middle of the ocean. There are 600 crew
          members on the ship, and their lives are in danger. Two options are
          proposed. Assume that the estimates of the consequences are as follows.
        </p>
        <h2 id="crew-question">Which option would you choose?</h2>
      </div>

      <div className={styles.options} role="group" aria-label="Choose one option">
        {selectedOptions.map((option) => (
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
