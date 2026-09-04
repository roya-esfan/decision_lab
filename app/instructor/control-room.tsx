"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityKey } from "@/lib/classroom";
import { summarizeOutcomeBiasCounts } from "@/lib/outcome-bias";
import styles from "../course.module.css";

type ActivityState = { key: ActivityKey; isOpen: boolean; isRevealed: boolean };
type ClassroomRun = {
  id: string;
  state: "open" | "closed";
  isActive: boolean;
  capacity: number;
  participantCount: number;
  completionCounts: Record<"rational-decision" | "rei-10", number>;
  completionTrackingReady: boolean;
  createdAt: string;
  expiresAt: string;
  activities: ActivityState[];
};
type ResultRow = { promptKey: string; label: string; counts: Record<string, number> };
type RunOption = {
  id: string;
  state: "open" | "closed";
  isActive: boolean;
  createdAt: string;
};

const activities: Array<{
  key: ActivityKey;
  number: number;
  title: string;
  activityHref: string;
  resultsPath: string;
}> = [
  {
    key: "assignment-1",
    number: 2,
    title: "A two-player bargain",
    activityHref: "/day/1/assignment-1",
    resultsPath: "/day/1/assignment-1/results",
  },
  {
    key: "outcome-bias",
    number: 3,
    title: "Evaluate the decision",
    activityHref: "/day/1/evaluate-the-decision",
    resultsPath: "/day/1/evaluate-the-decision/results",
  },
  {
    key: "assignment-2",
    number: 4,
    title: "Which exam results feel better?",
    activityHref: "/day/1/assignment-2",
    resultsPath: "/day/1/assignment-2/results",
  },
];

export function ControlRoom({ email }: { email: string }) {
  const [run, setRun] = useState<ClassroomRun | null>(null);
  const [recentRuns, setRecentRuns] = useState<RunOption[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ResultRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const currentRunId = run?.id;

  const loadRun = useCallback(async (runId?: string) => {
    try {
      const query = runId ? `?run=${encodeURIComponent(runId)}` : "";
      const response = await fetch(`/api/instructor/runs${query}`, { cache: "no-store" });
      const data = await response.json() as {
        run?: ClassroomRun | null;
        recentRuns?: RunOption[];
        activeRunId?: string | null;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "The classroom session could not be loaded.");
      setRun(data.run ?? null);
      setRecentRuns(data.recentRuns ?? []);
      setActiveRunId(data.activeRunId ?? null);
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
    if (!currentRunId) return;
    const initial = window.setTimeout(() => { void loadResults(currentRunId); }, 0);
    const timer = window.setInterval(() => {
      void loadRun(currentRunId);
      void loadResults(currentRunId);
    }, 2000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [currentRunId, loadResults, loadRun]);

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
      await Promise.all([loadRun(run.id), loadResults(run.id)]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The classroom session could not be updated.");
    } finally {
      setBusy("");
    }
  }

  function resetRun() {
    if (!run) return;
    const confirmed = window.confirm(
      "Reset this classroom session? All anonymous participants, responses, completion counts and activity states in this session will be permanently deleted. The session will then reopen empty.",
    );
    if (!confirmed) return;
    void updateRun({ action: "reset-run" }, "reset");
  }

  async function logout() {
    await fetch("/api/instructor/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (loading) {
    return <section className={styles.controlEmpty}><p>Loading the classroom…</p></section>;
  }

  if (!run) {
    return (
      <section className={styles.controlEmpty}>
        <p className={styles.eyebrow}>No classroom session yet</p>
        <h2>Prepare the classroom</h2>
        <p>
          Activities begin closed, so no responses are collected until you open
          a specific activity from this page.
        </p>
        <button type="button" onClick={() => void createRun()} disabled={busy === "create"}>
          {busy === "create" ? "Preparing…" : "Create classroom session"}
        </button>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <button className={styles.textButton} type="button" onClick={() => void logout()}>Sign out {email}</button>
      </section>
    );
  }

  return (
    <section className={styles.controlRoom}>
      {recentRuns.length > 1 && (
        <label className={styles.runSelector}>
          <span>Viewing session</span>
          <select
            value={run.id}
            onChange={(event) => void loadRun(event.target.value)}
          >
            {recentRuns.map((option, index) => (
              <option key={option.id} value={option.id}>
                {option.isActive ? "Live session" : index === 0 ? "Latest completed session" : "Previous session"}
                {` · ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(option.createdAt))}`}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className={styles.runStatus}>
        <div><span>Session</span><strong>{run.isActive ? "Live" : "Completed"}</strong></div>
        <div><span>Anonymous participants</span><strong>{run.participantCount}<small> / {run.capacity}</small></strong></div>
        <div className={styles.runActions}>
          {(!activeRunId || activeRunId === run.id) && (
            <button
              className={styles.resetButton}
              type="button"
              disabled={Boolean(busy)}
              onClick={resetRun}
            >{busy === "reset" ? "Resetting…" : "Reset & start over"}</button>
          )}
          {run.isActive ? (
            <button className={styles.dangerButton} type="button" disabled={Boolean(busy)} onClick={() => {
              if (window.confirm("End this classroom session? All activities will close. You can still enable review mode afterwards.")) {
                void updateRun({ action: "close-run" }, "close");
              }
            }}>End classroom session</button>
          ) : (
            activeRunId ? (
              <button type="button" onClick={() => void loadRun(activeRunId)}>Return to live session</button>
            ) : (
              <button type="button" disabled={Boolean(busy)} onClick={() => void createRun()}>
                {busy === "create" ? "Preparing…" : "Start a new session"}
              </button>
            )
          )}
        </div>
      </div>

      <div className={styles.controlSectionHeading}>
        <div>
          <p className={styles.eyebrow}>Day 1</p>
          <h2>Live activities and results</h2>
        </div>
        <p>Totals update automatically every two seconds</p>
      </div>

      <div className={styles.controlActivities}>
        {activities.map((activity) => {
          const state = run.activities.find((item) => item.key === activity.key);
          const activityResults = results[activity.key] ?? [];
          const mode = state?.isOpen && run.isActive
            ? "live"
            : state?.isRevealed
              ? "review"
              : "closed";
          const responseCount = activityResults.length === 0
            ? 0
            : Math.max(...activityResults.map((result) =>
                Object.values(result.counts).reduce((sum, count) => sum + count, 0),
              ));

          return (
            <article key={activity.key}>
              <header>
                <div>
                  <p className={styles.eyebrow}>Activity {activity.number}</p>
                  <h3>{activity.title}</h3>
                </div>
                <div className={styles.activityState}>
                  <span className={mode === "live" ? styles.stateLive : mode === "review" ? styles.stateRevealed : undefined}>
                    {!state ? "Database update required" : mode === "live" ? "Live · collecting" : mode === "review" ? "Review mode" : "Closed"}
                  </span>
                </div>
              </header>

              <div className={styles.activityResultSummary}>
                <div>
                  <span>Responses</span>
                  <strong>{responseCount}</strong>
                </div>
                <div className={styles.instructorResultRows}>
                  {activityResults.map((result) => {
                    const total = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
                    return (
                      <section key={result.promptKey}>
                        <header><strong>{result.label}</strong><span>{total} responses</span></header>
                        {activity.key === "outcome-bias" ? (
                          <div className={styles.instructorMeanRows}>
                            {summarizeOutcomeBiasCounts(result.counts).map((summary) => (
                              <div key={summary.condition}>
                                <span>Condition {summary.conditionNumber} · {summary.label}</span>
                                <strong>{summary.mean === null ? "—" : summary.mean.toFixed(2)}</strong>
                                <em>n = {summary.count}</em>
                              </div>
                            ))}
                          </div>
                        ) : (
                          Object.entries(result.counts).map(([choice, count]) => {
                            const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
                            return (
                              <div className={styles.instructorResultBar} key={choice}>
                                <span>{choice}</span>
                                <div aria-hidden="true"><i style={{ width: `${percentage}%` }} /></div>
                                <strong>{percentage}%</strong>
                                <em>{count}</em>
                              </div>
                            );
                          })
                        )}
                      </section>
                    );
                  })}
                  {activityResults.length === 0 && <p>Results could not be loaded yet.</p>}
                </div>
              </div>

              <footer>
                <a href={activity.activityHref} target="_blank" rel="noreferrer">Open student page</a>
                <a
                  href={`${activity.resultsPath}?projector=1&instructor=1&run=${encodeURIComponent(run.id)}`}
                  target="_blank"
                  rel="noreferrer"
                >Open presentation view</a>
                {!state ? (
                  <p className={styles.activitySetupWarning}>Run the latest Supabase migration, then refresh this page.</p>
                ) : mode === "live" ? (
                  <button
                    type="button"
                    disabled={!state || Boolean(busy)}
                    onClick={() => void updateRun(
                      { action: "set-activity-mode", activityKey: activity.key, mode: "closed" },
                      `${activity.key}-mode`,
                    )}
                  >Close & freeze responses</button>
                ) : mode === "review" ? (
                  <button
                    className={styles.hideButton}
                    type="button"
                    disabled={!state || Boolean(busy)}
                    onClick={() => void updateRun(
                      { action: "set-activity-mode", activityKey: activity.key, mode: "closed" },
                      `${activity.key}-mode`,
                    )}
                  >Close review mode</button>
                ) : (
                  <>
                    {run.isActive && (
                      <button
                        type="button"
                        disabled={!state || Boolean(busy)}
                        onClick={() => void updateRun(
                          { action: "set-activity-mode", activityKey: activity.key, mode: "live" },
                          `${activity.key}-mode`,
                        )}
                      >Open live activity</button>
                    )}
                    <button
                      className={styles.revealButton}
                      type="button"
                      disabled={!state || Boolean(busy)}
                      onClick={() => void updateRun(
                        { action: "set-activity-mode", activityKey: activity.key, mode: "review" },
                        `${activity.key}-mode`,
                      )}
                    >Enable review mode</button>
                  </>
                )}
              </footer>
            </article>
          );
        })}
      </div>

      <section className={styles.privateCompletionSection}>
        <header>
          <div>
            <p className={styles.eyebrow}>Private activities</p>
            <h2>Anonymous completions</h2>
          </div>
          <p>Only the number finished is collected. Student work, answers and scores remain in each browser.</p>
        </header>
        <div className={styles.privateCompletionRows}>
          <article>
            <span>Day 1 · Activity 5</span>
            <h3>Make a rational decision</h3>
            <strong>{run.completionCounts?.["rational-decision"] ?? 0}</strong>
            <small>finished</small>
          </article>
          <article>
            <span>Day 2 · Activity 1</span>
            <h3>How do you prefer to think?</h3>
            <strong>{run.completionCounts?.["rei-10"] ?? 0}</strong>
            <small>finished</small>
          </article>
        </div>
        {!run.completionTrackingReady && (
          <p className={styles.activitySetupWarning}>Run the latest Supabase migration to activate completion counts.</p>
        )}
      </section>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.textButton} type="button" onClick={() => void logout()}>Sign out {email}</button>
    </section>
  );
}
