"use client";

import { useEffect, useRef, useState } from "react";
import { deathCauses, type DeathCause } from "@/lib/day-two-activities";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import styles from "../day-two-activities.module.css";

function shuffle<T>(items: readonly T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

export function CauseRankingActivity() {
  const session = useLiveSession("causes-of-death");
  const idempotencyKey = useRef<string | null>(null);
  const draggedKey = useRef<string | null>(null);
  const [ranking, setRanking] = useState<DeathCause[]>([]);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setRanking(shuffle(deathCauses)));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function move(from: number, to: number) {
    if (to < 0 || to >= ranking.length || from === to) return;
    setRanking((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function dropOn(targetIndex: number) {
    const from = ranking.findIndex((item) => item.key === draggedKey.current);
    draggedKey.current = null;
    if (from >= 0) move(from, targetIndex);
  }

  async function submit() {
    if (ranking.length !== deathCauses.length) return;
    if (session.state === "review") {
      setComplete(true);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/causes-of-death", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: ranking.map((cause, index) => ({
            promptKey: cause.key,
            choice: String(index + 1),
          })),
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your ranking could not be submitted.");
      }
      setComplete(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your ranking could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (ranking.length === 0) {
    return <section className={styles.rankingLoading}>Preparing a randomized list…</section>;
  }

  if (complete) {
    return (
      <section className={styles.activityComplete} aria-live="polite">
        <p className={styles.eyebrow}>{session.state === "review" ? "Review complete" : "Ranking recorded"}</p>
        <h2>Your ranking</h2>
        <ol className={styles.completedRanking}>
          {ranking.map((cause) => <li key={cause.key}>{cause.label}</li>)}
        </ol>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="causes-of-death" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.rankingActivity} aria-labelledby="ranking-title">
      <div className={styles.rankingInstructions}>
        <h2 id="ranking-title">Arrange the list</h2>
        <p>Drag the rows or use the arrow buttons. Rank 1 is the highest estimated number of deaths.</p>
      </div>
      <ol className={styles.sortableRanking}>
        {ranking.map((cause, index) => (
          <li
            key={cause.key}
            draggable
            onDragStart={() => { draggedKey.current = cause.key; }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOn(index)}
          >
            <span className={styles.rankNumber}>{index + 1}</span>
            <span className={styles.dragHandle} aria-hidden="true">⋮⋮</span>
            <strong>{cause.label}</strong>
            <div>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label={`Move ${cause.label} up`}
              >↑</button>
              <button
                type="button"
                disabled={index === ranking.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={`Move ${cause.label} down`}
              >↓</button>
            </div>
          </li>
        ))}
      </ol>
      <div className={styles.rankingActions}>
        <button type="button" disabled={submitting} onClick={() => void submit()}>
          {submitting ? "Submitting…" : session.state === "review" ? "Finish ranking" : "Submit ranking"}
        </button>
      </div>
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
