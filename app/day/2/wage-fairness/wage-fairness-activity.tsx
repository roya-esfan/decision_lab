"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import {
  encodeWageFairnessResponse,
  type WageFairnessDecision,
  type WageFairnessGroup,
} from "@/lib/wage-fairness";
import sharedStyles from "../../../course.module.css";
import styles from "../../3/crew-problem/crew-problem.module.css";

const scenarios: Record<WageFairnessGroup, string> = {
  A: "A company is making a small profit. It is located in a community experiencing a recession with substantial unemployment but no inflation. Many workers are anxious to work at the company. The company decides to decrease wages and salaries 7 percent this year.",
  B: "A company is making a small profit. It is located in a community experiencing a recession with substantial unemployment and inflation of 12 percent. Many workers are anxious to work at the company. The company decides to increase wages and salaries 5 percent this year.",
};

export function WageFairnessActivity() {
  const session = useLiveSession("wage-fairness");
  const idempotencyKey = useRef<string | null>(null);
  const [group, setGroup] = useState<WageFairnessGroup | null>(null);
  const [choice, setChoice] = useState<WageFairnessDecision | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (!group) {
    return (
      <section className={styles.conditionPicker} aria-labelledby="group-title">
        <h2 id="group-title">Choose the group assigned to you</h2>
        <div role="group" aria-label="Choose Group A or Group B">
          <button type="button" onClick={() => setGroup("A")}>A</button>
          <button type="button" onClick={() => setGroup("B")}>B</button>
        </div>
      </section>
    );
  }

  async function choose(decision: WageFairnessDecision) {
    if (!group || submitting) return;
    if (session.state === "review") {
      setChoice(decision);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetchWithTransientRetry("/api/responses/wage-fairness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{
            promptKey: "wage-fairness-choice",
            choice: encodeWageFairnessResponse(group, decision),
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
        <h2>{session.state === "review" ? `You chose ${choice === "fair" ? "Fair" : "Unfair"}` : "Thank you"}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="wage-fairness" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="wage-fairness-question">
      <div className={styles.scenario}>
        <p>{scenarios[group]}</p>
        <h2 id="wage-fairness-question">Would you rate this action as fair or unfair?</h2>
      </div>
      <div className={styles.options} role="group" aria-label="Rate the company’s action">
        <button type="button" disabled={submitting} onClick={() => void choose("fair")}>
          <span>Option A</span>
          <strong>Fair</strong>
        </button>
        <button type="button" disabled={submitting} onClick={() => void choose("unfair")}>
          <span>Option B</span>
          <strong>Unfair</strong>
        </button>
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
