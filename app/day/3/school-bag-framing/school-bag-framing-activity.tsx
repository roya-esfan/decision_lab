"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import styles from "./school-bag-framing.module.css";

type Feeling = "Gain" | "Loss";

const questions = [
  {
    key: "school-bag-discount",
    label: "Cash discount",
    regularPrice: "1,000 kr",
    payment: "Pay cash and get 100 kr off.",
  },
  {
    key: "school-bag-surcharge",
    label: "Card surcharge",
    regularPrice: "900 kr",
    payment: "Pay by card and pay 100 kr extra.",
  },
] as const;

export function SchoolBagFramingActivity() {
  const session = useLiveSession("school-bag-framing");
  const idempotencyKey = useRef<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Feeling>>({});
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  const question = questions[questionIndex];
  const selectedAnswer = answers[question.key];

  async function next() {
    if (!selectedAnswer) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    const finishedAnswers = { ...answers, [question.key]: selectedAnswer };
    if (session.state === "review") {
      setAnswers(finishedAnswers);
      setComplete(true);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/school-bag-framing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: questions.map((item) => ({
            promptKey: item.key,
            choice: finishedAnswers[item.key],
          })),
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your responses could not be submitted.");
      }
      setAnswers(finishedAnswers);
      setComplete(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your responses could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <section className={styles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Responses recorded"}</p>
        <h2>{session.state === "review" ? "Your responses" : "Thank you"}</h2>
        {session.state === "review" && (
          <div className={styles.responseSummary}>
            {questions.map((item) => (
              <div key={item.key}>
                <span>{item.label}</span>
                <strong>{answers[item.key]}</strong>
              </div>
            ))}
          </div>
        )}
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="school-bag-framing" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="framing-question">
      <header className={styles.questionHeader}>
        <p>Question {questionIndex + 1} of {questions.length}</p>
      </header>

      <div className={styles.priceFacts}>
        <p><span>Regular price</span><strong>{question.regularPrice}</strong></p>
        <p>{question.payment}</p>
      </div>

      <h2 id="framing-question">Would this feel like a gain or a loss?</h2>

      <div className={styles.choices} role="group" aria-label="Choose gain or loss">
        {(["Gain", "Loss"] as const).map((feeling) => (
          <button
            className={selectedAnswer === feeling ? styles.selectedChoice : undefined}
            type="button"
            key={feeling}
            aria-pressed={selectedAnswer === feeling}
            onClick={() => setAnswers((current) => ({ ...current, [question.key]: feeling }))}
          >
            {feeling}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => setQuestionIndex((current) => current - 1)}
          disabled={questionIndex === 0 || submitting}
        >
          Back
        </button>
        <button type="button" onClick={() => void next()} disabled={!selectedAnswer || submitting}>
          {submitting
            ? "Submitting…"
            : questionIndex === questions.length - 1
              ? session.state === "review" ? "Finish" : "Submit responses"
              : "Next question"}
        </button>
      </div>
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
