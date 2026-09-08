"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityKey } from "@/lib/classroom";
import { summarizeCauseRankings } from "@/lib/day-two-activities";
import { summarizeOutcomeBiasCounts } from "@/lib/outcome-bias";
import styles from "../course.module.css";

type ResultRow = { promptKey: string; label: string; counts: Record<string, number> };
type ResultState =
  | { status: "loading" }
  | { status: "no-run" }
  | { status: "hidden" }
  | { status: "revealed"; results: ResultRow[] }
  | { status: "error"; message: string };

export function LiveResults({
  activityKey,
  projector = false,
  instructorRunId,
}: {
  activityKey: ActivityKey;
  projector?: boolean;
  instructorRunId?: string;
}) {
  const [state, setState] = useState<ResultState>({ status: "loading" });

  const load = useCallback(async () => {
    try {
      const endpoint = instructorRunId
        ? `/api/instructor/results?run=${encodeURIComponent(instructorRunId)}&activity=${activityKey}`
        : `/api/results?activity=${activityKey}`;
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json() as { status?: string; results?: ResultRow[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Results could not be loaded.");
      if (instructorRunId && data.results) setState({ status: "revealed", results: data.results });
      else if (data.status === "revealed" && data.results) setState({ status: "revealed", results: data.results });
      else if (data.status === "hidden") setState({ status: "hidden" });
      else setState({ status: "no-run" });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Results could not be loaded." });
    }
  }, [activityKey, instructorRunId]);

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

  if (activityKey === "causes-of-death") {
    return <CauseRankingResults results={state.results} showHeatmap={projector} />;
  }

  return (
    <section className={styles.liveResultRows} aria-live="polite" aria-label="Revealed class results">
      {state.results.map((result, index) => {
        const total = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
        return (
          <article key={result.promptKey}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><h2>{result.label}</h2><strong>{total} responses</strong></header>
            {activityKey === "outcome-bias" ? (
              <OutcomeMeanComparison counts={result.counts} />
            ) : (
              <div className={styles.liveResultChart}>
                {Object.entries(result.counts).map(([choice, count]) => {
                  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
                  return (
                    <div
                      className={styles.liveResultColumn}
                      key={choice}
                      aria-label={`${choice}: ${percentage}% (${count} ${count === 1 ? "response" : "responses"})`}
                    >
                      <strong>{percentage}%</strong>
                      <div aria-hidden="true">
                        <i style={{ height: percentage === 0 ? "2px" : `${percentage}%` }} />
                      </div>
                      <span>{choice}</span>
                      <em>{count} {count === 1 ? "response" : "responses"}</em>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
      {activityKey === "company-revenue" && (
        <p className={styles.correctAnswerNote}><strong>Answer:</strong> Group B had the larger combined sales revenue.</p>
      )}
    </section>
  );
}

function CauseRankingResults({ results, showHeatmap }: { results: ResultRow[]; showHeatmap: boolean }) {
  const summaries = summarizeCauseRankings(results);
  const responseCount = summaries.length === 0 ? 0 : Math.max(...summaries.map((item) => item.total));
  const formatNumber = new Intl.NumberFormat("en-US");

  return (
    <section className={styles.causeRankingResults} aria-live="polite" aria-label="Class cause-of-death ranking">
      <header>
        <div>
          <p className={styles.eyebrow}>Class ranking</p>
          <h2>Ordered by average rank</h2>
        </div>
        <strong>{responseCount} {responseCount === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.causeRankTable} role="table" aria-label="Average class rank and published estimates">
        <div role="row" className={styles.causeRankHead}>
          <span role="columnheader">Class order</span>
          <span role="columnheader">Cause</span>
          <span role="columnheader">Average rank</span>
          <span role="columnheader">Estimated deaths in 2000</span>
        </div>
        {summaries.map((summary, index) => (
          <div role="row" key={summary.promptKey}>
            <strong role="cell">{index + 1}</strong>
            <div role="cell">
              <span>{summary.label}</span>
              <div className={styles.rankDistribution} aria-label={`Distribution of ranks for ${summary.label}`}>
                {["1", "2", "3", "4", "5"].map((rank) => {
                  const count = summary.counts[rank] ?? 0;
                  const percentage = summary.total === 0 ? 0 : Math.round((count / summary.total) * 100);
                  return <i key={rank} title={`Rank ${rank}: ${percentage}%`} style={{ flexBasis: `${percentage}%` }} />;
                })}
              </div>
            </div>
            <strong role="cell">{summary.meanRank === null ? "—" : summary.meanRank.toFixed(2)}</strong>
            <span role="cell">{summary.deaths2000 === null ? "—" : formatNumber.format(summary.deaths2000)}</span>
          </div>
        ))}
      </div>
      {showHeatmap && <CauseRankHeatmap summaries={summaries} />}
      <p className={styles.resultSourceNote}>
        Reference: Mokdad, A. H., Marks, J. S., Stroup, D. F., &amp; Gerberding,
        J. L. (2004). Actual causes of death in the United States, 2000.
        <em> JAMA, 291</em>(10), 1238–1245. Corrected 2005.
      </p>
    </section>
  );
}

function CauseRankHeatmap({ summaries }: { summaries: ReturnType<typeof summarizeCauseRankings> }) {
  return (
    <section className={styles.rankHeatmapSection} aria-label="Class rank distribution heatmap">
      <header>
        <p className={styles.eyebrow}>Rank distribution</p>
        <h2>How the class used each rank</h2>
      </header>
      <div className={styles.rankHeatmapScroll}>
        <div className={styles.rankHeatmap} role="table" aria-label="Percentage of the class assigning each rank">
          <div role="row" className={styles.rankHeatmapHead}>
            <span role="columnheader">Cause</span>
            {["1", "2", "3", "4", "5"].map((rank) => (
              <span role="columnheader" key={rank}>Rank {rank}</span>
            ))}
          </div>
          {summaries.map((summary) => (
            <div role="row" key={summary.promptKey}>
              <strong role="cell">{summary.label}</strong>
              {["1", "2", "3", "4", "5"].map((rank) => {
                const count = summary.counts[rank] ?? 0;
                const percentage = summary.total === 0 ? 0 : Math.round((count / summary.total) * 100);
                return (
                  <span
                    className={styles.rankHeatCell}
                    role="cell"
                    key={rank}
                    title={`${count} ${count === 1 ? "response" : "responses"}`}
                    style={{
                      backgroundColor: heatmapColour(percentage),
                      color: percentage >= 45 ? "#ffffff" : "#14213d",
                    }}
                    aria-label={`Rank ${rank}: ${percentage}%, ${count} ${count === 1 ? "response" : "responses"}`}
                  >
                    {percentage}%
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function heatmapColour(percentage: number) {
  const opacity = percentage === 0 ? 0.035 : 0.12 + (percentage / 100) * 0.78;
  return `rgba(30, 68, 158, ${opacity})`;
}

function OutcomeMeanComparison({ counts }: { counts: Record<string, number> }) {
  const summaries = summarizeOutcomeBiasCounts(counts);
  return (
    <div className={styles.outcomeMeanChart} aria-label="Mean evaluation by condition">
      <div className={styles.outcomeScaleLabels} aria-hidden="true">
        <span>+3</span><span>0</span><span>−3</span>
      </div>
      {summaries.map((summary) => {
        const barHeight = summary.mean === null ? 0 : Math.max(1, (Math.abs(summary.mean) / 3) * 50);
        const meanLabel = summary.mean === null ? "—" : summary.mean.toFixed(2);
        return (
          <div
            className={styles.outcomeMeanColumn}
            key={summary.condition}
            aria-label={`Condition ${summary.conditionNumber}, ${summary.label}: mean ${meanLabel}, ${summary.count} responses`}
          >
            <div className={styles.outcomeMeanPlot} aria-hidden="true">
              <span />
              {summary.mean !== null && (
                <i
                  className={summary.mean >= 0 ? styles.positiveMean : styles.negativeMean}
                  style={{ height: `${barHeight}%` }}
                />
              )}
            </div>
            <strong>{meanLabel}</strong>
            <span>Condition {summary.conditionNumber} · {summary.label}</span>
            <em>{summary.count} {summary.count === 1 ? "response" : "responses"}</em>
          </div>
        );
      })}
    </div>
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
