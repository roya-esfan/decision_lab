"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityKey } from "@/lib/classroom";
import styles from "../course.module.css";

type ActivityState = { key: ActivityKey; isOpen: boolean; isRevealed: boolean };
type ClassroomRun = {
  id: string;
  joinCode: string;
  state: "open" | "closed";
  joinsOpen: boolean;
  capacity: number;
  participantCount: number;
  expiresAt: string;
  activities: ActivityState[];
};
type ResultRow = { promptKey: string; label: string; counts: Record<string, number> };

const activities: Array<{ key: ActivityKey; title: string; resultsHref: string }> = [
  { key: "assignment-1", title: "Assignment 1 · Two-player bargain", resultsHref: "/day/1/assignment-1/results?projector=1" },
  { key: "assignment-2", title: "Assignment 2 · Exam result", resultsHref: "/day/1/assignment-2/results?projector=1" },
];

export function ControlRoom({ email }: { email: string }) {
  const [run, setRun] = useState<ClassroomRun | null>(null);
  const [results, setResults] = useState<Record<string, ResultRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const activeRunId = run?.id;

  const loadRun = useCallback(async () => {
    try {
      const response = await fetch("/api/instructor/runs", { cache: "no-store" });
      const data = await response.json() as { run?: ClassroomRun | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "The classroom session could not be loaded.");
      setRun(data.run ?? null);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The classroom session could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResults = useCallback(async (runId: string) => {
    const entries = await Promise.all(activities.map(async (activity) => {
      const response = await fetch(`/api/instructor/results?run=${runId}&activity=${activity.key}`, { cache: "no-store" });
      if (!response.ok) return [activity.key, []] as const;
      const data = await response.json() as { results?: ResultRow[] };
      return [activity.key, data.results ?? []] as const;
    }));
    setResults(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRun(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRun]);
  useEffect(() => {
    if (!activeRunId) return;
    const initial = window.setTimeout(() => { void loadResults(activeRunId); }, 0);
    const timer = window.setInterval(() => {
      void loadRun();
      void loadResults(activeRunId);
    }, 2000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [activeRunId, loadResults, loadRun]);

  async function createRun() {
    setBusy("create");
    setError("");
    try {
      const response = await fetch("/api/instructor/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity: 120 }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The classroom session could not be created.");
      await loadRun();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The classroom session could not be created.");
    } finally {
      setBusy("");
    }
  }

  async function updateRun(payload: Record<string, unknown>, key: string) {
    if (!run) return;
    setBusy(key);
    setError("");
    try {
      const response = await fetch(`/api/instructor/runs/${run.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The classroom session could not be updated.");
      await loadRun();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The classroom session could not be updated.");
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    await fetch("/api/instructor/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (loading) return <section className={styles.controlEmpty}><p>Loading classroom control…</p></section>;

  if (!run) {
    return (
      <section className={styles.controlEmpty}>
        <p className={styles.eyebrow}>No active session</p>
        <h2>Start when the class is ready</h2>
        <p>A new eight-character join code will be created. It expires after eight hours.</p>
        <button type="button" onClick={() => void createRun()} disabled={busy === "create"}>{busy === "create" ? "Starting…" : "Start classroom session"}</button>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <button className={styles.textButton} type="button" onClick={() => void logout()}>Sign out {email}</button>
      </section>
    );
  }

  return (
    <section className={styles.controlRoom}>
      <div className={styles.runStatus}>
        <div><span>Join code</span><strong>{run.joinCode}</strong></div>
        <div><span>Participants</span><strong>{run.participantCount}<small> / {run.capacity}</small></strong></div>
        <div><span>Joining</span><strong>{run.joinsOpen && run.state === "open" ? "Open" : "Locked"}</strong></div>
        <div className={styles.runActions}>
          {run.state === "open" && <button type="button" disabled={busy === "joins"} onClick={() => void updateRun({ action: "set-joins", open: !run.joinsOpen }, "joins")}>{run.joinsOpen ? "Lock joining" : "Open joining"}</button>}
          {run.state === "open" && <button className={styles.dangerButton} type="button" disabled={busy === "close"} onClick={() => {
            if (window.confirm("Close this classroom session? Students will no longer be able to submit.")) void updateRun({ action: "close-run" }, "close");
          }}>Close session</button>}
        </div>
      </div>

      <div className={styles.controlActivities}>
        {activities.map((activity) => {
          const state = run.activities.find((item) => item.key === activity.key);
          const activityResults = results[activity.key] ?? [];
          return (
            <article key={activity.key}>
              <header>
                <div><p className={styles.eyebrow}>{activity.key}</p><h2>{activity.title}</h2></div>
                <a href={activity.resultsHref} target="_blank" rel="noreferrer">Open projector view</a>
              </header>
              <div className={styles.previewResults}>
                {activityResults.map((result) => (
                  <div key={result.promptKey}>
                    <strong>{result.label}</strong>
                    <p>{Object.entries(result.counts).map(([choice, count]) => `${choice}: ${count}`).join(" · ")}</p>
                  </div>
                ))}
                {activityResults.length === 0 && <p>No responses yet.</p>}
              </div>
              <footer>
                <button type="button" disabled={!state || run.state === "closed" || busy === `${activity.key}-open`} onClick={() => void updateRun({ action: "set-activity", activityKey: activity.key, open: !state?.isOpen }, `${activity.key}-open`)}>{state?.isOpen ? "Close responses" : "Open responses"}</button>
                <button className={state?.isRevealed ? styles.hideButton : styles.revealButton} type="button" disabled={!state || busy === `${activity.key}-reveal`} onClick={() => void updateRun({ action: "set-activity", activityKey: activity.key, revealed: !state?.isRevealed }, `${activity.key}-reveal`)}>{state?.isRevealed ? "Hide results" : "Reveal results"}</button>
              </footer>
            </article>
          );
        })}
      </div>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.textButton} type="button" onClick={() => void logout()}>Sign out {email}</button>
    </section>
  );
}
