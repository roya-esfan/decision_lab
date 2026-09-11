"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import { probabilityNewsCases } from "@/lib/probability-news";
import styles from "./probability-news.module.css";

const ratings = Array.from({ length: 11 }, (_, index) => String(index));

export function ProbabilityNewsActivity() {
  const session = useLiveSession("probability-news");
  const idempotencyKey = useRef<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  const allAnswered = probabilityNewsCases.every((item) => Boolean(answers[item.key]));

  async function submit() {
    if (!allAnswered) return;
    if (session.state === "review") {
      setComplete(true);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/probability-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: probabilityNewsCases.map((item) => ({
            promptKey: item.key,
            choice: answers[item.key],
          })),
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your ratings could not be submitted.");
      }
      setComplete(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your ratings could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <section className={styles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>{session.state === "review" ? "Your ratings" : "Thank you"}</h2>
        {session.state === "review" ? (
          <>
            <dl className={styles.answerSummary}>
              {probabilityNewsCases.map((item) => (
                <div key={item.key}>
                  <dt>{item.letter} · {item.change}</dt>
                  <dd>{answers[item.key] === "not-sure" ? "Not sure" : `${answers[item.key]} / 10`}</dd>
                </div>
              ))}
            </dl>
            <div className={sharedStyles.reviewResults}>
              <header>
                <p className={sharedStyles.eyebrow}>From the classroom session</p>
                <h2>Class results</h2>
              </header>
              <LiveResults activityKey="probability-news" />
            </div>
          </>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="probability-news-question">
      <div className={styles.introduction}>
        <p id="probability-news-question">
          In the four examples below, your chance of receiving <strong>$1 million</strong> increases by five percentage points.
        </p>
        <h2>How good does the news feel in each case?</h2>
        <p>Rate each change from 0 to 10. Choose “Not sure” if you are uncertain.</p>
      </div>

      <div className={styles.ratingList}>
        {probabilityNewsCases.map((item) => (
          <fieldset className={styles.ratingCard} key={item.key}>
            <legend>
              <span>{item.letter}</span>
              <strong>{item.change}</strong>
            </legend>
            <div className={styles.scaleLabels} aria-hidden="true">
              <span>Not good news</span>
              <span>Extremely good news</span>
            </div>
            <div className={styles.scale} role="radiogroup" aria-label={`${item.change}: rate from 0 to 10`}>
              {ratings.map((rating) => (
                <label className={answers[item.key] === rating ? styles.selectedRating : undefined} key={rating}>
                  <input
                    type="radio"
                    name={item.key}
                    value={rating}
                    checked={answers[item.key] === rating}
                    onChange={() => setAnswers((current) => ({ ...current, [item.key]: rating }))}
                  />
                  <span aria-hidden="true" />
                  <strong>{rating}</strong>
                </label>
              ))}
            </div>
            <label className={`${styles.notSure} ${answers[item.key] === "not-sure" ? styles.selectedNotSure : ""}`}>
              <input
                type="radio"
                name={item.key}
                value="not-sure"
                checked={answers[item.key] === "not-sure"}
                onChange={() => setAnswers((current) => ({ ...current, [item.key]: "not-sure" }))}
              />
              <span aria-hidden="true" />
              Not sure
            </label>
          </fieldset>
        ))}
      </div>

      <div className={styles.actions}>
        <span>{Object.keys(answers).length} of 4 rated</span>
        <button type="button" disabled={!allAnswered || submitting} onClick={() => void submit()}>
          {submitting ? "Submitting…" : session.state === "review" ? "Finish" : "Submit ratings"}
        </button>
      </div>
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
