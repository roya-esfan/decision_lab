"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import {
  encodeOutcomeBiasResponse,
  outcomeBiasConditions,
  outcomeBiasRatingLabels,
  outcomeBiasRatings,
  type OutcomeBiasConditionNumber,
} from "@/lib/outcome-bias";
import sharedStyles from "../../../course.module.css";
import styles from "./evaluate-decision.module.css";

type Rating = (typeof outcomeBiasRatings)[number];

const scenarios: Array<{
  id: string;
  title: string;
  body: ReactNode;
  outcomes: Record<"failure" | "success", string>;
  question: string;
}> = [
  {
    id: "outcome-bypass",
    title: "Bypass operation",
    body: (
      <p>
        A 55-year-old man had a heart condition. He had to stop working because
        of chest pain. He enjoyed his work and did not want to stop. His pain
        also interfered with other things, such as travel and recreation. A type
        of bypass operation would relieve his pain and increase his life
        expectancy from age 65 to age 70. However, 8% of the people who have
        this operation die from the operation itself.
      </p>
    ),
    outcomes: {
      failure: "His physician decided to go ahead with the operation. The operation failed and the man died.",
      success: "His physician decided to go ahead with the operation. The operation succeeded.",
    },
    question: "Evaluate the physician’s decision to go ahead with the operation.",
  },
  {
    id: "outcome-diagnostic-test",
    title: "Diagnostic test",
    body: (
      <p>
        A patient has a foot infection. The physician orders a diagnostic test.
        The test is so inaccurate that, given the information available, the
        patient should be treated with antibiotics regardless of the test
        result. The test comes back negative. The physician nevertheless treats
        the patient with antibiotics.
      </p>
    ),
    outcomes: {
      failure: "The patient is not cured.",
      success: "The patient is cured.",
    },
    question: "Evaluate the physician’s decision to order the test.",
  },
  {
    id: "outcome-gamble",
    title: "Prize choice",
    body: (
      <>
        <p>
          A 25-year-old man is unmarried and has a steady job. He receives a
          letter inviting him to visit Quiet Pond Cottages, where he has been
          considering buying some property. As a prize for visiting the
          property, he is given a choice between:
        </p>
        <dl className={styles.options}>
          <div><dt>Option 1</dt><dd>$200</dd></div>
          <div><dt>Option 2</dt><dd>An 80% chance of winning $300 and a 20% chance of winning nothing</dd></div>
        </dl>
        <p>He must mail in his decision in advance. He chooses Option 2.</p>
      </>
    ),
    outcomes: {
      failure: "He wins nothing.",
      success: "He wins $300.",
    },
    question: "Evaluate his decision to choose Option 2.",
  },
];

export function EvaluateDecisionActivity() {
  const session = useLiveSession("outcome-bias");
  const idempotencyKey = useRef<string | null>(null);
  const [conditionNumber, setConditionNumber] = useState<OutcomeBiasConditionNumber | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (!conditionNumber) {
    return (
      <section className={styles.conditionPicker} aria-labelledby="condition-title">
        <p>Before you start</p>
        <h2 id="condition-title">Choose a number</h2>
        <div role="group" aria-label="Choose number 1 or 2">
          <button type="button" onClick={() => setConditionNumber("1")}>1</button>
          <button type="button" onClick={() => setConditionNumber("2")}>2</button>
        </div>
      </section>
    );
  }

  const condition = outcomeBiasConditions[conditionNumber];
  const scenario = scenarios[scenarioIndex];
  const selectedRating = ratings[scenario.id];

  async function next() {
    if (selectedRating === undefined) return;
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex((current) => current + 1);
      return;
    }

    const finishedRatings = { ...ratings, [scenario.id]: selectedRating };
    if (session.state === "review") {
      setRatings(finishedRatings);
      setComplete(true);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/outcome-bias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: scenarios.map((item) => ({
            promptKey: item.id,
            choice: encodeOutcomeBiasResponse(condition, finishedRatings[item.id]),
          })),
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) throw new Error(data.error ?? "Your response could not be submitted.");
      setRatings(finishedRatings);
      setComplete(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your response could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <section className={styles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>{session.state === "review" ? "Your evaluations" : "Thank you"}</h2>
        <div className={styles.responseSummary}>
          {scenarios.map((item, index) => (
            <div key={item.id}>
              <span>Scenario {index + 1}</span>
              <strong>{ratings[item.id]}</strong>
            </div>
          ))}
        </div>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="outcome-bias" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
        <SourceCitation />
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="scenario-title">
      <header className={styles.scenarioHeader}>
        <div>
          <p>Scenario {scenarioIndex + 1} of {scenarios.length}</p>
          <h2 id="scenario-title">{scenario.title}</h2>
        </div>
        <span>Number {conditionNumber}</span>
      </header>

      <div className={styles.scenarioText}>
        {scenario.body}
        <p className={styles.outcome}>{scenario.outcomes[condition]}</p>
      </div>

      <div className={styles.evaluationPrompt}>
        <p>Evaluate the decision itself—the quality of thinking that went into it.</p>
        <h3>{scenario.question}</h3>
      </div>

      <div className={styles.ratingScale} role="group" aria-label="Decision evaluation scale from 3 to minus 3">
        {outcomeBiasRatings.map((rating) => (
          <button
            className={selectedRating === rating ? styles.selectedRating : undefined}
            type="button"
            key={rating}
            aria-pressed={selectedRating === rating}
            onClick={() => setRatings((current) => ({ ...current, [scenario.id]: rating }))}
          >
            <strong>{rating}</strong>
            <span>{outcomeBiasRatingLabels[rating]}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={() => setScenarioIndex((current) => current - 1)} disabled={scenarioIndex === 0}>Back</button>
        <button type="button" onClick={() => void next()} disabled={selectedRating === undefined || submitting}>
          {submitting ? "Submitting…" : scenarioIndex === scenarios.length - 1 ? (session.state === "review" ? "Finish" : "Submit evaluations") : "Next scenario"}
        </button>
      </div>
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}

function SourceCitation() {
  return (
    <aside className={styles.source}>
      <strong>Source</strong>
      <p>
        Adapted from Baron, J., &amp; Hershey, J. C. (1988). Outcome bias in
        decision evaluation. <em>Journal of Personality and Social Psychology,
        54</em>(4), 569–579. <a href="https://doi.org/10.1037/0022-3514.54.4.569" target="_blank" rel="noreferrer">https://doi.org/10.1037/0022-3514.54.4.569</a>
      </p>
    </aside>
  );
}
