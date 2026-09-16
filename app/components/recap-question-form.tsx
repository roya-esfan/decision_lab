"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import {
  recapQuestionDeadline,
  recapQuestionDeadlineHasPassed,
  recapQuestionDeadlineLabel,
  recapQuestionMaxLength,
} from "@/lib/recap-questions";
import styles from "../home.module.css";

const draftStorageKey = "oaadm-recap-question-draft";

type SubmissionState = "idle" | "saving" | "saved" | "error";

export function RecapQuestionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");
  const [deadlinePassed, setDeadlinePassed] = useState(() => recapQuestionDeadlineHasPassed());
  const idempotencyKey = useRef<string | null>(null);
  const attemptedQuestion = useRef<string | null>(null);

  useEffect(() => {
    const updateDeadline = () => setDeadlinePassed(recapQuestionDeadlineHasPassed());
    const initial = window.setTimeout(() => {
      try {
        const savedDraft = window.localStorage.getItem(draftStorageKey);
        if (savedDraft) setQuestion(savedDraft);
      } catch {
        // The form still works when browser storage is unavailable.
      }
      updateDeadline();
    }, 0);
    const timer = window.setInterval(updateDeadline, 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function updateQuestion(value: string) {
    setQuestion(value);
    try {
      window.localStorage.setItem(draftStorageKey, value);
    } catch {
      // Browser storage is only a backup; submission does not depend on it.
    }
    if (attemptedQuestion.current !== null && attemptedQuestion.current !== value.trim()) {
      idempotencyKey.current = null;
      attemptedQuestion.current = null;
    }
    if (state !== "saving") {
      setState("idle");
      setMessage("");
    }
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || deadlinePassed) return;

    idempotencyKey.current ??= crypto.randomUUID();
    attemptedQuestion.current = trimmed;
    setState("saving");
    setMessage("");

    try {
      const response = await fetchWithTransientRetry("/api/recap-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          question: trimmed,
        }),
      });
      const result = await response.json().catch(() => null) as { error?: string; saved?: boolean } | null;
      if (!response.ok || !result?.saved) {
        throw new Error(result?.error ?? "The question could not be saved. Please try again.");
      }

      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // The database save has already been confirmed.
      }
      setState("saved");
      setMessage("Saved. Your question has been received anonymously.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The question could not be saved. Please try again.");
    }
  }

  function startAnother() {
    setQuestion("");
    setState("idle");
    setMessage("");
    idempotencyKey.current = null;
    attemptedQuestion.current = null;
  }

  return (
    <div className={styles.recapQuestionControl}>
      <button
        className={styles.recapQuestionToggle}
        type="button"
        aria-expanded={isOpen}
        aria-controls="recap-question-form"
        onClick={() => setIsOpen((current) => !current)}
      >
        Submit a question
      </button>

      {isOpen ? (
        <div className={styles.recapQuestionOverlay} role="presentation">
          <section
            id="recap-question-form"
            className={styles.recapQuestionPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recap-question-title"
          >
            <button className={styles.recapQuestionClose} type="button" onClick={() => setIsOpen(false)} aria-label="Close question form">×</button>
            <div className={styles.recapQuestionIntro}>
              <h3 id="recap-question-title">What should we revisit in the final session?</h3>
              <p>Share any question, topic or uncertainty you would like covered in the course recap.</p>
              <p>Anonymous · Only the instructor can view submissions</p>
              <time dateTime={recapQuestionDeadline}>Deadline: {recapQuestionDeadlineLabel}</time>
            </div>

            {deadlinePassed ? (
              <p className={styles.recapQuestionClosed}>Question collection is now closed.</p>
            ) : state === "saved" ? (
              <div className={styles.recapQuestionSaved} role="status">
                <strong>{message}</strong>
                <button type="button" onClick={startAnother}>Submit another question</button>
              </div>
            ) : (
              <form onSubmit={submitQuestion}>
                <label htmlFor="recap-question">Your question or uncertainty</label>
                <textarea
                  id="recap-question"
                  value={question}
                  onChange={(event) => updateQuestion(event.target.value)}
                  maxLength={recapQuestionMaxLength}
                  rows={5}
                  disabled={state === "saving"}
                  autoFocus
                  required
                />
                <div className={styles.recapQuestionActions}>
                  <span>{question.length}/{recapQuestionMaxLength}</span>
                  <button type="submit" disabled={!question.trim() || state === "saving"}>
                    {state === "saving" ? "Saving…" : state === "error" ? "Try again" : "Send anonymously"}
                  </button>
                </div>
                {message ? <p className={styles.recapQuestionError} role="alert">{message}</p> : null}
                <p className={styles.recapDraftNote}>Your draft stays on this device until the database confirms it has been saved.</p>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
