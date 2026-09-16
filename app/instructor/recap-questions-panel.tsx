"use client";

import { useCallback, useEffect, useState } from "react";
import { recapQuestionDeadlineLabel } from "@/lib/recap-questions";
import styles from "./recap-questions-panel.module.css";

type RecapQuestion = {
  id: string;
  question: string;
  createdAt: string;
};

const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function RecapQuestionsPanel() {
  const [questions, setQuestions] = useState<RecapQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/instructor/recap-questions", { cache: "no-store" });
      const result = await response.json().catch(() => null) as { questions?: RecapQuestion[]; error?: string } | null;
      if (!response.ok || !result?.questions) {
        throw new Error(result?.error ?? "The questions could not be loaded.");
      }
      setQuestions(result.questions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The questions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadQuestions(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQuestions]);

  return (
    <section className={styles.panel} aria-labelledby="recap-questions-heading">
      <header>
        <div>
          <p>Final session</p>
          <h2 id="recap-questions-heading">Anonymous recap questions</h2>
          <span>Deadline: {recapQuestionDeadlineLabel}</span>
        </div>
        <div className={styles.summary}>
          <strong>{questions.length}</strong>
          <span>{questions.length === 1 ? "question" : "questions"}</span>
          <button type="button" onClick={() => void loadQuestions()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {!error && !loading && questions.length === 0 ? (
        <p className={styles.empty}>No questions have been submitted yet.</p>
      ) : null}
      {questions.length > 0 ? (
        <ol className={styles.list}>
          {questions.map((item) => (
            <li key={item.id}>
              <p>{item.question}</p>
              <time dateTime={item.createdAt}>{timestampFormatter.format(new Date(item.createdAt))}</time>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
