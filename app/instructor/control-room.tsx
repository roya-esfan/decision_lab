"use client";

import { useCallback, useEffect, useState } from "react";
import {
  courseActivityCatalog,
  isResponseActivityKey,
  teachingDayNumbers,
  type ControlledActivityKey,
  type TeachingDayNumber,
} from "@/lib/activity-catalog";
import type { ActivityKey } from "@/lib/classroom";
import { summarizeOutcomeBiasCounts } from "@/lib/outcome-bias";
import styles from "../course.module.css";

type ActivityState = { key: ControlledActivityKey; isOpen: boolean; isRevealed: boolean };
type ClassroomRun = {
  id: string;
  state: "open" | "closed";
  isActive: boolean;
  capacity: number;
  participantCount: number;
  completionCounts: Record<"life-experience-bingo" | "rational-decision" | "rei-10", number>;
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

const responseActivities = courseActivityCatalog.filter(
  (activity): activity is typeof activity & { key: ActivityKey; kind: "responses" } =>
    activity.kind === "responses" && isResponseActivityKey(activity.key),
);

export function ControlRoom({ email }: { email: string }) {
  const [run, setRun] = useState<ClassroomRun | null>(null);
  const [recentRuns, setRecentRuns] = useState<RunOption[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<TeachingDayNumber>(1);
  const [results, setResults] = useState<Record<string, ResultRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const currentRunId = run?.id;
  const dayActivities = courseActivityCatalog.filter((activity) => activity.day === selectedDay);

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
    const entries = await Promise.all(responseActivities.map(async (activity) => {
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

  async function startFreshRun() {
    if (!run) return;
    if (run.isActive && !window.confirm(
      "Close the current session and start a new empty one? The current session and all its results will remain saved in the session dropdown.",
    )) return;

    setBusy("fresh");
    setError("");
    try {
      if (run.isActive) {
        const closeResponse = await fetch(`/api/instructor/runs/${run.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close-run" }),
        });
        const closeData = await closeResponse.json() as { error?: string };
        if (!closeResponse.ok) throw new Error(closeData.error ?? "The current session could not be closed.");
      }

      const createResponse = await fetch("/api/instructor/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity: run.capacity }),
      });
      const createData = await createResponse.json() as { error?: string };
      if (!createResponse.ok) throw new Error(createData.error ?? "A fresh classroom session could not be created.");

      setResults({});
      await loadRun();
    } catch (caught) {
      await loadRun(run.id);
      setError(caught instanceof Error ? caught.message : "A fresh classroom session could not be created.");
    } finally {
      setBusy("");
    }
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
              className={styles.freshSessionButton}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void startFreshRun()}
            >{busy === "fresh" ? "Starting…" : "Start fresh session"}</button>
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

      <nav className={styles.instructorDayTabs} aria-label="Choose teaching day">
        {teachingDayNumbers.map((day) => {
          const activityCount = courseActivityCatalog.filter((activity) => activity.day === day).length;
          return (
            <button
              className={selectedDay === day ? styles.selectedDayTab : undefined}
              type="button"
              key={day}
              aria-current={selectedDay === day ? "page" : undefined}
              onClick={() => setSelectedDay(day)}
            >
              <span>Day</span>
              <strong>{String(day).padStart(2, "0")}</strong>
              <small>{activityCount === 0 ? "No activities" : `${activityCount} ${activityCount === 1 ? "activity" : "activities"}`}</small>
            </button>
          );
        })}
      </nav>

      <div className={styles.controlSectionHeading}>
        <div>
          <p className={styles.eyebrow}>Day {selectedDay}</p>
          <h2>Activities and results</h2>
        </div>
        {dayActivities.some((activity) => activity.kind === "responses") && (
          <p>Totals update automatically every two seconds</p>
        )}
      </div>

      {dayActivities.length === 0 ? (
        <section className={styles.dayControlEmpty}>
          <h3>No activities have been added to Day {selectedDay} yet</h3>
          <p>When an activity is prepared for this day, its availability controls will appear here.</p>
        </section>
      ) : (
        <div className={styles.controlActivities}>
          {dayActivities.map((activity) => {
            const state = run.activities.find((item) => item.key === activity.key);
            const responseActivity = isResponseActivityKey(activity.key);
            const activityResults = responseActivity ? results[activity.key] ?? [] : [];
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
            const completionCount = activity.kind === "private"
              ? run.completionCounts?.[activity.key as keyof ClassroomRun["completionCounts"]] ?? 0
              : 0;

            return (
              <article key={activity.key}>
                <header>
                  <div>
                    <p className={styles.eyebrow}>Activity {activity.number}</p>
                    <h3>{activity.title}</h3>
                  </div>
                  <div className={styles.activityState}>
                    <span className={mode === "live" ? styles.stateLive : mode === "review" ? styles.stateRevealed : undefined}>
                      {!state ? "Database update required" : mode === "live" ? "Live" : mode === "review" ? "Review mode" : "Closed"}
                    </span>
                  </div>
                </header>

                {responseActivity ? (
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
                ) : (
                  <div className={styles.privateActivitySummary}>
                    <div>
                      <span>Anonymous completions</span>
                      <strong>{completionCount}</strong>
                      <small>{activity.completionLabel}</small>
                    </div>
                    <p>Only this total is collected. Student work, answers, scores, cards and marked squares remain in each browser.</p>
                    {!run.completionTrackingReady && (
                      <p className={styles.activitySetupWarning}>Run the latest Supabase migration to activate completion counts.</p>
                    )}
                  </div>
                )}

                <footer>
                  <a href={activity.activityHref} target="_blank" rel="noreferrer">Open student page</a>
                  {activity.resultsPath && (
                    <a
                      href={`${activity.resultsPath}?projector=1&instructor=1&run=${encodeURIComponent(run.id)}`}
                      target="_blank"
                      rel="noreferrer"
                    >Open presentation view</a>
                  )}
                  {!state ? (
                    <p className={styles.activitySetupWarning}>Run the latest Supabase migration, then refresh this page.</p>
                  ) : mode === "live" ? (
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => void updateRun(
                        { action: "set-activity-mode", activityKey: activity.key, mode: "closed" },
                        `${activity.key}-mode`,
                      )}
                    >{responseActivity ? "Close & freeze responses" : "Close activity"}</button>
                  ) : mode === "review" ? (
                    <button
                      className={styles.hideButton}
                      type="button"
                      disabled={Boolean(busy)}
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
                          disabled={Boolean(busy)}
                          onClick={() => void updateRun(
                            { action: "set-activity-mode", activityKey: activity.key, mode: "live" },
                            `${activity.key}-mode`,
                          )}
                        >Open live activity</button>
                      )}
                      <button
                        className={styles.revealButton}
                        type="button"
                        disabled={Boolean(busy)}
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
      )}
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.textButton} type="button" onClick={() => void logout()}>Sign out {email}</button>
    </section>
  );
}
