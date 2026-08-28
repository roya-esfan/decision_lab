"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityKey } from "@/lib/classroom";
import styles from "../course.module.css";

type ResultRow = { promptKey: string; label: string; counts: Record<string, number> };
type ResultState =
  | { status: "loading" }
  | { status: "no-run" }
  | { status: "hidden" }
  | { status: "revealed"; results: ResultRow[] }
  | { status: "error"; message: string };

export function LiveResults({ activityKey, projector = false }: { activityKey: ActivityKey; projector?: boolean }) {
  const [state, setState] = useState<ResultState>({ status: "loading" });

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/results?activity=${activityKey}`, { cache: "no-store" });
      const data = await response.json() as { status?: string; results?: ResultRow[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Results could not be loaded.");
      if (data.status === "revealed" && data.results) setState({ status: "revealed", results: data.results });
      else if (data.status === "hidden") setState({ status: "hidden" });
      else setState({ status: "no-run" });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Results could not be loaded." });
    }
  }, [activityKey]);

  useEffect(() => {
    const initial = window.setTimeout(() => { void load(); }, 0);
    if (!projector) return () => window.clearTimeout(initial);
    const timer = window.setInterval(() => { void load(); }, 2000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [load, projector]);

  if (state.status === "loading") return <ResultNotice title="Loading class results…" />;
  if (state.status === "no-run") return <ResultNotice title="No live classroom session" detail="The instructor has not started a session yet." onRefresh={() => void load()} />;
  if (state.status === "hidden") return <ResultNotice title="Results are still hidden" detail="The instructor will reveal them when the class is ready to discuss." onRefresh={projector ? undefined : () => void load()} />;
  if (state.status === "error") return <ResultNotice title="Results are unavailable" detail={state.message} onRefresh={() => void load()} />;

  return (
    <section className={styles.liveResultRows} aria-live="polite" aria-label="Revealed class results">
      {state.results.map((result, index) => {
        const total = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
        return (
          <article key={result.promptKey}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><h2>{result.label}</h2><strong>{total} responses</strong></header>
            <div>
              {Object.entries(result.counts).map(([choice, count]) => {
                const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
                return (
                  <div className={styles.liveResultBar} key={choice}>
                    <span>{choice}</span>
                    <div aria-hidden="true"><i style={{ width: `${percentage}%` }} /></div>
                    <strong>{percentage}%</strong>
                    <em>{count}</em>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ResultNotice({ title, detail, onRefresh }: { title: string; detail?: string; onRefresh?: () => void }) {
  return (
    <section className={styles.resultNotice} aria-live="polite">
      <span aria-hidden="true" />
      <h2>{title}</h2>
      {detail && <p>{detail}</p>}
      {onRefresh && <button type="button" onClick={onRefresh}>Check again</button>}
    </section>
  );
}
