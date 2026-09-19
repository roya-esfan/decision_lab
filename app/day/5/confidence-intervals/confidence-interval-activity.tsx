"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import {
  confidenceIntervalMax,
  confidenceIntervalQuestions,
  encodeConfidenceInterval,
} from "@/lib/confidence-intervals";
import sharedStyles from "../../../course.module.css";
import styles from "./confidence-intervals.module.css";

type RangeDraft = { minimum: string; maximum: string };

const emptyRanges = confidenceIntervalQuestions.map((): RangeDraft => ({ minimum: "", maximum: "" }));
const emptyChecks = confidenceIntervalQuestions.map(() => false);

export function ConfidenceIntervalActivity() {
  const session = useLiveSession("confidence-intervals");
  const idempotencyKey = useRef<string | null>(null);
  const [ranges, setRanges] = useState<RangeDraft[]>(emptyRanges);
  const [checks, setChecks] = useState<boolean[]>(emptyChecks);
  const [submitted, setSubmitted] = useState(false);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const storageKey = session.runId ? `confidence-intervals:${session.runId}` : null;

  useEffect(() => {
    if (!storageKey || hydratedKey === storageKey) return;
    const timer = window.setTimeout(() => {
      setRanges(emptyRanges.map((range) => ({ ...range })));
      setChecks([...emptyChecks]);
      setSubmitted(false);
      idempotencyKey.current = null;
      try {
        const saved = window.sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            ranges?: RangeDraft[];
            checks?: boolean[];
            submitted?: boolean;
          };
          if (parsed.ranges?.length === confidenceIntervalQuestions.length) setRanges(parsed.ranges);
          if (parsed.checks?.length === confidenceIntervalQuestions.length) setChecks(parsed.checks);
          setSubmitted(parsed.submitted === true);
        }
      } catch {
        // A stored draft is optional; the activity still works without it.
      }
      setHydratedKey(storageKey);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydratedKey, storageKey]);

  useEffect(() => {
    if (!storageKey || hydratedKey !== storageKey) return;
    window.sessionStorage.setItem(storageKey, JSON.stringify({ ranges, checks, submitted }));
  }, [checks, hydratedKey, ranges, storageKey, submitted]);

  const checkedCount = useMemo(() => checks.filter(Boolean).length, [checks]);
  const checkedPercentage = checkedCount * 10;

  function updateRange(index: number, field: keyof RangeDraft, value: string) {
    setRanges((current) => current.map((range, rangeIndex) =>
      rangeIndex === index ? { ...range, [field]: value } : range,
    ));
  }

  async function register() {
    if (submitting || submitted) return;
    setSubmissionError("");

    const intervals = ranges.map((range) => ({
      minimum: Number(range.minimum),
      maximum: Number(range.maximum),
      hasValues: range.minimum.trim() !== "" && range.maximum.trim() !== "",
    }));
    const invalidIndex = intervals.findIndex((interval) =>
      !interval.hasValues
      || !Number.isFinite(interval.minimum)
      || !Number.isFinite(interval.maximum)
      || interval.minimum < 0
      || interval.maximum < interval.minimum
      || interval.maximum > confidenceIntervalMax,
    );
    if (invalidIndex >= 0) {
      setSubmissionError(`Check the minimum and maximum for Question ${invalidIndex + 1}.`);
      return;
    }

    if (session.state === "review") {
      setSubmitted(true);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    try {
      const response = await fetchWithTransientRetry("/api/responses/confidence-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: confidenceIntervalQuestions.map((question, index) => ({
            promptKey: question.promptKey,
            choice: encodeConfidenceInterval(intervals[index]),
          })),
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your responses could not be registered.");
      }
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your responses could not be registered.");
    } finally {
      setSubmitting(false);
    }
  }

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  return (
    <>
      <section className={styles.intervalActivity} aria-labelledby="interval-instructions">
        <header className={styles.instructions}>
          <h2 id="interval-instructions">Enter your 90% confidence interval for each question</h2>
          <p>Use the questions shown in class. Your minimum and maximum will remain visible after you register them.</p>
        </header>

        {submitted && (
          <p className={styles.registeredStatus} role="status">
            {session.state === "review" ? "Ranges ready for review" : "All ten ranges have been registered"}
          </p>
        )}

        <div className={styles.intervalTable} role="table" aria-label="Confidence intervals">
          <div className={styles.intervalHead} role="row">
            <span role="columnheader">Question</span>
            <span role="columnheader">Minimum</span>
            <span role="columnheader">Maximum</span>
            <span role="columnheader">Within range</span>
          </div>
          {confidenceIntervalQuestions.map((question, index) => (
            <div className={styles.intervalRow} role="row" key={question.promptKey}>
              <strong role="rowheader">Question {question.number}</strong>
              <label>
                <span>Minimum</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={confidenceIntervalMax}
                  step="any"
                  value={ranges[index].minimum}
                  readOnly={submitted}
                  aria-label={`Question ${question.number}, minimum`}
                  onChange={(event) => updateRange(index, "minimum", event.target.value)}
                />
              </label>
              <label>
                <span>Maximum</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={confidenceIntervalMax}
                  step="any"
                  value={ranges[index].maximum}
                  readOnly={submitted}
                  aria-label={`Question ${question.number}, maximum`}
                  onChange={(event) => updateRange(index, "maximum", event.target.value)}
                />
              </label>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={checks[index]}
                  disabled={!submitted}
                  aria-label={`The answer to Question ${question.number} was within my range`}
                  onChange={(event) => setChecks((current) => current.map((checked, checkIndex) =>
                    checkIndex === index ? event.target.checked : checked,
                  ))}
                />
                <span>Yes</span>
              </label>
            </div>
          ))}
        </div>

        {!submitted ? (
          <div className={styles.registerActions}>
            <button type="button" disabled={submitting} onClick={() => void register()}>
              {submitting ? "Registering…" : "Register"}
            </button>
          </div>
        ) : (
          <section className={styles.calibrationScore} aria-live="polite">
            <span>Answers within your ranges</span>
            <strong>{checkedCount} of 10</strong>
            <em>{checkedPercentage}%</em>
          </section>
        )}
        {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
      </section>

      {submitted && session.state === "review" && (
        <div className={sharedStyles.reviewResults}>
          <header>
            <p className={sharedStyles.eyebrow}>From the classroom session</p>
            <h2>Class results</h2>
          </header>
          <LiveResults activityKey="confidence-intervals" />
        </div>
      )}
    </>
  );
}
