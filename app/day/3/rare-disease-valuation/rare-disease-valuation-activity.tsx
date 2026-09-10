"use client";

import { useRef, useState } from "react";
import {
  encodeRareDiseaseValuation,
  maximumValuationNok,
  type RareDiseaseConditionLetter,
} from "@/lib/rare-disease-valuation";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import courseStyles from "../../../course.module.css";
import sharedStyles from "../crew-problem/crew-problem.module.css";
import styles from "./rare-disease-valuation.module.css";

const scenarios: Record<RareDiseaseConditionLetter, {
  text: string;
  question: string;
}> = {
  A: {
    text: "Suppose that by attending this lecture you have exposed yourself to a rare, fatal disease. If you contract the disease, you will die a quick and painless death sometime next week. The chance that you will contract the disease is 1 in 1,000. We have a single dose of an antidote for this disease that we will sell to the highest bidder. If you take the antidote, the risk of dying from the disease is zero. If you are short on cash, we will lend you the money at zero interest, with 30 years to repay it.",
    question: "What is the most you would be willing to pay for the antidote?",
  },
  B: {
    text: "Researchers at the university hospital are studying the same rare disease. They need volunteers who would be willing to enter a room for five minutes and expose themselves to the same 1 in 1,000 risk of contracting the disease and dying a quick and painless death during the following week. No antidote will be available.",
    question: "What is the least amount of money you would demand to participate in this research study?",
  },
};

export function RareDiseaseValuationActivity() {
  const session = useLiveSession("rare-disease-valuation");
  const idempotencyKey = useRef<string | null>(null);
  const [condition, setCondition] = useState<RareDiseaseConditionLetter | null>(null);
  const [amount, setAmount] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (!condition) {
    return (
      <section className={sharedStyles.conditionPicker} aria-labelledby="condition-title">
        <h2 id="condition-title">Choose the group assigned to you</h2>
        <div role="group" aria-label="Choose group A or B">
          <button type="button" onClick={() => setCondition("A")}>A</button>
          <button type="button" onClick={() => setCondition("B")}>B</button>
        </div>
      </section>
    );
  }

  const scenario = scenarios[condition];

  async function submit() {
    if (!condition || !/^\d{1,10}$/.test(amount)) {
      setSubmissionError("Enter a whole amount in NOK.");
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 0 || numericAmount > maximumValuationNok) {
      setSubmissionError("Enter an amount between 0 and 1,000,000,000 NOK.");
      return;
    }

    if (session.state === "review") {
      setSubmittedAmount(numericAmount);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/rare-disease-valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{
            promptKey: "rare-disease-amount",
            choice: encodeRareDiseaseValuation(condition, numericAmount),
          }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your response could not be submitted.");
      }
      setSubmittedAmount(numericAmount);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your response could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedAmount !== null) {
    return (
      <section className={sharedStyles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>{session.state === "review"
          ? `${new Intl.NumberFormat("nb-NO").format(submittedAmount)} NOK`
          : "Thank you"}</h2>
        {session.state === "review" ? (
          <div className={courseStyles.reviewResults}>
            <header>
              <p className={courseStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="rare-disease-valuation" />
          </div>
        ) : (
          <p className={courseStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={`${sharedStyles.activity} ${styles.activity}`} aria-labelledby="valuation-question">
      <div className={sharedStyles.scenario}>
        <p>{scenario.text}</p>
        <h2 id="valuation-question">{scenario.question}</h2>
      </div>

      <div className={styles.amountEntry}>
        <label htmlFor="valuation-amount">Your amount</label>
        <div>
          <span>NOK</span>
          <input
            id="valuation-amount"
            type="number"
            inputMode="numeric"
            min="0"
            max={maximumValuationNok}
            step="1"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setSubmissionError("");
            }}
            placeholder="0"
            aria-describedby="amount-guidance"
          />
        </div>
        <p id="amount-guidance">Enter a whole amount in Norwegian kroner.</p>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={() => void submit()} disabled={amount === "" || submitting}>
          {submitting ? "Submitting…" : session.state === "review" ? "Finish" : "Submit amount"}
        </button>
      </div>
      {submissionError && <p className={courseStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
