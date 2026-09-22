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
type RangeCheck = "yes" | "no" | null;
type SubmissionMode = "live" | "review" | null;

const emptyRanges = confidenceIntervalQuestions.map((): RangeDraft => ({ minimum: "", maximum: "" }));
const emptyChecks = confidenceIntervalQuestions.map((): RangeCheck => null);

function normalizeNumberDraft(value: string) {
  const cleaned = value.replaceAll(",", "").replace(/[^\d.]/g, "");
  const [integer = "", ...decimalParts] = cleaned.split(".");
  return decimalParts.length === 0 ? integer : `${integer}.${decimalParts.join("")}`;
}

function formatNumberDraft(value: string, useGrouping: boolean) {
  if (!useGrouping || value === "") return value;
  const [integer, decimal] = value.split(".");
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal === undefined ? groupedInteger : `${groupedInteger}.${decimal}`;
}

export function ConfidenceIntervalActivity() {
  const session = useLiveSession("confidence-intervals");
  const idempotencyKey = useRef<string | null>(null);
  const [ranges, setRanges] = useState<RangeDraft[]>(emptyRanges);
  const [checks, setChecks] = useState<RangeCheck[]>(emptyChecks);
  const [submitted, setSubmitted] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>(null);
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
      setSubmissionMode(null);
      idempotencyKey.current = null;
      try {
        let saved = window.sessionStorage.getItem(storageKey);
        if (!saved) {
          const previousKeys = Array.from({ length: window.sessionStorage.length }, (_, index) =>
            window.sessionStorage.key(index),
          ).filter((key): key is string => Boolean(key?.startsWith("confidence-intervals:")));
          for (const previousKey of previousKeys.reverse()) {
            const candidate = window.sessionStorage.getItem(previousKey);
            if (candidate) {
              saved = candidate;
              break;
            }
          }
        }
        if (saved) {
          const parsed = JSON.parse(saved) as {
            ranges?: RangeDraft[];
            checks?: Array<RangeCheck | boolean>;
            submitted?: boolean;
            submissionMode?: SubmissionMode;
          };
          if (parsed.ranges?.length === confidenceIntervalQuestions.length) setRanges(parsed.ranges);
          if (parsed.checks?.length === confidenceIntervalQuestions.length) {
            setChecks(parsed.checks.map((check) => check === true ? "yes" : check === false ? null : check));
          }
          if (parsed.submitted === true) {
            const savedMode = parsed.submissionMode === "live" || parsed.submissionMode === "review"
              ? parsed.submissionMode
              : session.state === "review"
                ? "review"
                : null;
            setSubmissionMode(savedMode);
            setSubmitted(savedMode !== null);
          }
        }
      } catch {
        // A stored draft is optional; the activity still works without it.
      }
      setHydratedKey(storageKey);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydratedKey, session.state, storageKey]);

  useEffect(() => {
    if (!storageKey || hydratedKey !== storageKey) return;
    window.sessionStorage.setItem(storageKey, JSON.stringify({ ranges, checks, submitted, submissionMode }));
  }, [checks, hydratedKey, ranges, storageKey, submissionMode, submitted]);

  const checkedCount = useMemo(() => checks.filter((check) => check === "yes").length, [checks]);
  const checkedPercentage = checkedCount * 10;
  const isRegistered = submitted && !(session.state === "joined" && submissionMode === "review");

  function updateRange(index: number, field: keyof RangeDraft, value: string) {
    setRanges((current) => current.map((range, rangeIndex) =>
      rangeIndex === index ? { ...range, [field]: value } : range,
    ));
  }

  async function register() {
    if (submitting || isRegistered) return;
    setSubmissionError("");

    const intervals = ranges.map((range) => ({
      minimum: Number(range.minimum.replaceAll(",", "")),
      maximum: Number(range.maximum.replaceAll(",", "")),
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
      setSubmissionMode("review");
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
        if (response.status === 409 && data.error?.includes("already responded")) {
          setSubmitted(true);
          setSubmissionMode("live");
          return;
        }
        throw new Error(data.error ?? "Your responses could not be registered.");
      }
      setSubmitted(true);
      setSubmissionMode("live");
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

        {isRegistered && (
          <p className={styles.registeredStatus} role="status">
            {submissionMode === "live"
              ? "All ten ranges have been registered"
              : "Review complete — these ranges have not been added to the classroom results"}
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
                  type="text"
                  inputMode="decimal"
                  className={styles.numberInput}
                  value={formatNumberDraft(ranges[index].minimum, question.number !== 1)}
                  readOnly={isRegistered}
                  aria-label={`Question ${question.number}, minimum`}
                  onChange={(event) => updateRange(index, "minimum", normalizeNumberDraft(event.target.value))}
                />
              </label>
              <label>
                <span>Maximum</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.numberInput}
                  value={formatNumberDraft(ranges[index].maximum, question.number !== 1)}
                  readOnly={isRegistered}
                  aria-label={`Question ${question.number}, maximum`}
                  onChange={(event) => updateRange(index, "maximum", normalizeNumberDraft(event.target.value))}
                />
              </label>
              <div className={styles.checkButtons} role="group" aria-label={`Was the answer to Question ${question.number} within your range?`}>
                <button
                  type="button"
                  disabled={!isRegistered}
                  aria-pressed={checks[index] === "yes"}
                  onClick={() => setChecks((current) => current.map((check, checkIndex) =>
                    checkIndex === index ? "yes" : check,
                  ))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={!isRegistered}
                  aria-pressed={checks[index] === "no"}
                  onClick={() => setChecks((current) => current.map((check, checkIndex) =>
                    checkIndex === index ? "no" : check,
                  ))}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isRegistered ? (
          <div className={styles.registerActions}>
            <button type="button" disabled={submitting} onClick={() => void register()}>
              {submitting ? "Registering…" : session.state === "review" ? "Finish review" : "Register"}
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

      {isRegistered && session.state === "review" && (
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
