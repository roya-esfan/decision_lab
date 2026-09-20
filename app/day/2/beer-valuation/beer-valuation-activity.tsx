"use client";

import { useRef, useState } from "react";
import {
  encodeBeerValuation,
  maximumBeerPriceNok,
  type BeerValuationGroup,
} from "@/lib/beer-valuation";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import courseStyles from "../../../course.module.css";
import sharedStyles from "../../3/crew-problem/crew-problem.module.css";
import amountStyles from "../../3/rare-disease-valuation/rare-disease-valuation.module.css";

const scenarios: Record<BeerValuationGroup, string> = {
  A: "You are lying on the beach on a hot day. All you have to drink is ice water. For the last hour you have been thinking about how much you would enjoy a nice cold bottle of your favorite brand of beer. A companion gets up to go make a phone call and offers to bring back a beer from the only nearby place where beer is sold, a fancy resort hotel. He says that the beer might be expensive and so asks how much you are willing to pay for the beer. He says that he will buy the beer if it costs as much or less than the price you state. But if it costs more than the price you state he will not buy it. You trust your friend, and there is no possibility of bargaining with the bartender.",
  B: "You are lying on the beach on a hot day. All you have to drink is ice water. For the last hour you have been thinking about how much you would enjoy a nice cold bottle of your favorite brand of beer. A companion gets up to go make a phone call and offers to bring back a beer from the only nearby place where beer is sold, a small run-down grocery store. He says that the beer might be expensive and so asks how much you are willing to pay for the beer. He says that he will buy the beer if it costs as much or less than the price you state. But if it costs more than the price you state he will not buy it. You trust your friend, and there is no possibility of bargaining with the store owner.",
};

export function BeerValuationActivity() {
  const session = useLiveSession("beer-valuation");
  const idempotencyKey = useRef<string | null>(null);
  const [group, setGroup] = useState<BeerValuationGroup | null>(null);
  const [amount, setAmount] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (!group) {
    return (
      <section className={sharedStyles.conditionPicker} aria-labelledby="group-title">
        <h2 id="group-title">Choose the group assigned to you</h2>
        <div role="group" aria-label="Choose Group A or Group B">
          <button type="button" onClick={() => setGroup("A")}>A</button>
          <button type="button" onClick={() => setGroup("B")}>B</button>
        </div>
      </section>
    );
  }

  async function submit() {
    if (!group || !/^\d{1,7}$/.test(amount)) {
      setSubmissionError("Enter a whole amount in NOK.");
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 0 || numericAmount > maximumBeerPriceNok) {
      setSubmissionError("Enter an amount between 0 and 1,000,000 NOK.");
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
      const response = await fetchWithTransientRetry("/api/responses/beer-valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{
            promptKey: "beer-price",
            choice: encodeBeerValuation(group, numericAmount),
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
            <LiveResults activityKey="beer-valuation" />
          </div>
        ) : (
          <p className={courseStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={`${sharedStyles.activity} ${amountStyles.activity}`} aria-labelledby="beer-price-question">
      <div className={sharedStyles.scenario}>
        <p>{scenarios[group]}</p>
        <h2 id="beer-price-question">What price do you tell him?</h2>
      </div>

      <div className={amountStyles.amountEntry}>
        <label htmlFor="beer-price">Your price</label>
        <div>
          <span>NOK</span>
          <input
            id="beer-price"
            type="number"
            inputMode="numeric"
            min="0"
            max={maximumBeerPriceNok}
            step="1"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setSubmissionError("");
            }}
            placeholder="0"
            aria-describedby="price-guidance"
          />
        </div>
        <p id="price-guidance">Enter a whole amount in Norwegian kroner.</p>
      </div>

      <div className={amountStyles.actions}>
        <button type="button" onClick={() => void submit()} disabled={amount === "" || submitting}>
          {submitting ? "Submitting…" : session.state === "review" ? "Finish" : "Submit price"}
        </button>
      </div>
      {submissionError && <p className={courseStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
