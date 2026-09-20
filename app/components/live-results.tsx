"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityKey } from "@/lib/classroom";
import { summarizeCauseRankings } from "@/lib/day-two-activities";
import { summarizeCalculatorTripCounts } from "@/lib/calculator-trip";
import { summarizeEndowmentFramingCounts } from "@/lib/endowment-framing";
import { summarizeCrewProblemCounts } from "@/lib/crew-problem";
import { summarizeOutcomeBiasCounts } from "@/lib/outcome-bias";
import { summarizeRareDiseaseValuations } from "@/lib/rare-disease-valuation";
import { summarizeLandDisputeCounts } from "@/lib/land-dispute";
import { summarizeConfidenceIntervalResults } from "@/lib/confidence-intervals";
import { summarizeWageFairnessCounts } from "@/lib/wage-fairness";
import { summarizeBeerValuations } from "@/lib/beer-valuation";
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

  if (activityKey === "crew-problem") {
    return <CrewProblemResults results={state.results} />;
  }

  if (activityKey === "calculator-trip") {
    return <CalculatorTripResults results={state.results} />;
  }

  if (activityKey === "endowment-framing") {
    return <EndowmentFramingResults results={state.results} />;
  }

  if (activityKey === "rare-disease-valuation") {
    return <RareDiseaseValuationResults results={state.results} />;
  }

  if (activityKey === "land-dispute") {
    return <LandDisputeResults results={state.results} />;
  }

  if (activityKey === "confidence-intervals") {
    return <ConfidenceIntervalResults results={state.results} />;
  }

  if (activityKey === "wage-fairness") {
    return <WageFairnessResults results={state.results} />;
  }

  if (activityKey === "beer-valuation") {
    return <BeerValuationResults results={state.results} />;
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

function WageFairnessResults({ results }: { results: ResultRow[] }) {
  const summaries = summarizeWageFairnessCounts(results[0]?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);

  return (
    <section className={styles.crewFrameResults} aria-live="polite" aria-label="Fairness ratings by group">
      <header>
        <div><p className={styles.eyebrow}>Class ratings</p><h2>Rating by group</h2></div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.crewFrameComparison}>
        {summaries.map((summary) => (
          <section className={styles.crewFrameGroup} key={summary.group}>
            <header>
              <div><span>Group {summary.group}</span><h3>{summary.label}</h3></div>
              <strong>n = {summary.total}</strong>
            </header>
            <div className={styles.liveResultChart}>
              {(["fair", "unfair"] as const).map((decision) => {
                const count = summary[decision];
                const percentage = summary[`${decision}Percentage`];
                const label = decision === "fair" ? "Fair" : "Unfair";
                return (
                  <div className={styles.liveResultColumn} key={decision} aria-label={`Group ${summary.group}, ${label}: ${percentage}% (${count} responses)`}>
                    <strong>{percentage}%</strong>
                    <div aria-hidden="true"><i style={{ height: percentage === 0 ? "2px" : `${percentage}%` }} /></div>
                    <span>{label}</span>
                    <em>{count} {count === 1 ? "response" : "responses"}</em>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function ConfidenceIntervalResults({ results }: { results: ResultRow[] }) {
  const summaries = summarizeConfidenceIntervalResults(results);
  const responseCount = Math.max(0, ...summaries.map((summary) => summary.total));

  return (
    <section className={styles.confidenceResults} aria-live="polite" aria-label="Class confidence interval results">
      <header className={styles.confidenceResultsHeader}>
        <div>
          <p className={styles.eyebrow}>Class estimates</p>
          <h2>Average intervals and crowd estimates</h2>
        </div>
        <strong>{responseCount} {responseCount === 1 ? "response" : "responses"}</strong>
      </header>
      <p className={styles.confidenceResultsIntro}>
        Each curve is fitted to the midpoint of the intervals submitted by the class. The average interval uses the mean minimum and mean maximum.
      </p>
      <div className={styles.confidenceQuestionResults}>
        {summaries.map((summary) => (
          <article key={summary.promptKey}>
            <header>
              <h3>Question {summary.number}</h3>
              <span className={summary.trueValueWithinMeanInterval ? styles.intervalHit : styles.intervalMiss}>
                {summary.total === 0
                  ? "No responses"
                  : summary.trueValueWithinMeanInterval
                    ? "True answer within average interval"
                    : "True answer outside average interval"}
              </span>
            </header>
            <ConfidenceDistribution summary={summary} />
            <dl>
              <div>
                <dt>Average interval</dt>
                <dd>{formatInterval(summary.meanMinimum, summary.meanMaximum)}</dd>
              </div>
              <div>
                <dt>Crowd estimate</dt>
                <dd>{formatEstimate(summary.meanMidpoint)}</dd>
              </div>
              <div>
                <dt>True answer</dt>
                <dd>{formatEstimate(summary.trueValue)}</dd>
              </div>
              <div>
                <dt>Responses</dt>
                <dd>{summary.total}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

type ConfidenceSummary = ReturnType<typeof summarizeConfidenceIntervalResults>[number];

function ConfidenceDistribution({ summary }: { summary: ConfidenceSummary }) {
  if (
    summary.meanMinimum === null
    || summary.meanMaximum === null
    || summary.meanMidpoint === null
    || summary.midpointStandardDeviation === null
  ) {
    return <div className={styles.emptyConfidencePlot}>No class estimates yet</div>;
  }

  const deviation = summary.midpointStandardDeviation;
  const spread = deviation > 0 ? deviation * 3 : Math.max(Math.abs(summary.meanMidpoint) * 0.08, 1);
  const domainMinimum = Math.min(summary.meanMinimum, summary.trueValue, summary.meanMidpoint - spread);
  let domainMaximum = Math.max(summary.meanMaximum, summary.trueValue, summary.meanMidpoint + spread);
  if (domainMaximum === domainMinimum) domainMaximum = domainMinimum + 1;
  const domainWidth = domainMaximum - domainMinimum;
  const x = (value: number) => ((value - domainMinimum) / domainWidth) * 600;
  const intervalStart = Math.max(0, Math.min(600, x(summary.meanMinimum)));
  const intervalEnd = Math.max(0, Math.min(600, x(summary.meanMaximum)));
  const meanX = Math.max(0, Math.min(600, x(summary.meanMidpoint)));
  const trueX = Math.max(0, Math.min(600, x(summary.trueValue)));

  let curvePath = "";
  if (deviation > 0) {
    const points = Array.from({ length: 121 }, (_, index) => {
      const plotX = index * 5;
      const value = domainMinimum + (plotX / 600) * domainWidth;
      const density = Math.exp(-0.5 * ((value - summary.meanMidpoint) / deviation) ** 2);
      const plotY = 154 - density * 116;
      return `${index === 0 ? "M" : "L"}${plotX.toFixed(1)},${plotY.toFixed(1)}`;
    });
    curvePath = `${points.join(" ")} L600,154 L0,154 Z`;
  }

  return (
    <div className={styles.confidencePlot}>
      <svg viewBox="0 0 600 175" role="img" aria-label={`Distribution of midpoint estimates for Question ${summary.number}`}>
        <line className={styles.confidenceAxis} x1="0" y1="154" x2="600" y2="154" />
        <rect
          className={styles.meanIntervalBand}
          x={Math.min(intervalStart, intervalEnd)}
          y="145"
          width={Math.max(3, Math.abs(intervalEnd - intervalStart))}
          height="18"
        />
        {curvePath && <path className={styles.confidenceCurve} d={curvePath} />}
        <line className={styles.crowdMeanLine} x1={meanX} y1="28" x2={meanX} y2="160" />
        <line className={styles.trueAnswerLine} x1={trueX} y1="18" x2={trueX} y2="160" />
      </svg>
      <div className={styles.confidenceLegend}>
        <span><i className={styles.meanLegend} />Crowd estimate</span>
        <span><i className={styles.trueLegend} />True answer</span>
        <span><i className={styles.intervalLegend} />Average interval</span>
      </div>
      {deviation === 0 && summary.total > 0 && (
        <p>All submitted midpoint estimates were identical, so no curve is shown.</p>
      )}
    </div>
  );
}

const resultNumberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function formatEstimate(value: number | null) {
  return value === null ? "—" : resultNumberFormatter.format(value);
}

function formatInterval(minimum: number | null, maximum: number | null) {
  if (minimum === null || maximum === null) return "—";
  return `${formatEstimate(minimum)}–${formatEstimate(maximum)}`;
}

function LandDisputeResults({ results }: { results: ResultRow[] }) {
  const result = results[0];
  const summaries = summarizeLandDisputeCounts(result?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);

  return (
    <section className={styles.crewFrameResults} aria-live="polite" aria-label="Settlement recommendations by role">
      <header>
        <div><p className={styles.eyebrow}>Class choices</p><h2>Recommendation by role</h2></div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.crewFrameComparison}>
        {summaries.map((summary) => (
          <section className={styles.crewFrameGroup} key={summary.group}>
            <header>
              <div><span>Group {summary.groupLetter}</span><h3>{summary.label}</h3></div>
              <strong>n = {summary.total}</strong>
            </header>
            <div className={styles.liveResultChart}>
              {(["yes", "no"] as const).map((decision) => {
                const count = summary[decision];
                const percentage = summary[`${decision}Percentage`];
                const label = decision === "yes" ? "Yes" : "No";
                return (
                  <div className={styles.liveResultColumn} key={decision} aria-label={`${summary.label}, ${label}: ${percentage}% (${count} responses)`}>
                    <strong>{percentage}%</strong>
                    <div aria-hidden="true"><i style={{ height: percentage === 0 ? "2px" : `${percentage}%` }} /></div>
                    <span>{label}</span>
                    <em>{count} {count === 1 ? "response" : "responses"}</em>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function RareDiseaseValuationResults({ results }: { results: ResultRow[] }) {
  const summaries = summarizeRareDiseaseValuations(results[0]?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);
  const formatter = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });

  return (
    <section className={styles.valuationResults} aria-live="polite" aria-label="Amounts by condition">
      <header>
        <div>
          <p className={styles.eyebrow}>Class responses</p>
          <h2>Amount by condition</h2>
        </div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.valuationComparison}>
        {summaries.map((summary) => (
          <section key={summary.condition}>
            <header>
              <span>Group {summary.condition}</span>
              <h3>{summary.label}</h3>
              <p>{summary.measure}</p>
            </header>
            <dl>
              <div>
                <dt>Median</dt>
                <dd>{summary.median === null ? "—" : `${formatter.format(summary.median)} NOK`}</dd>
              </div>
              <div>
                <dt>Mean</dt>
                <dd>{summary.mean === null ? "—" : `${formatter.format(summary.mean)} NOK`}</dd>
              </div>
              <div>
                <dt>Responses</dt>
                <dd>{summary.total}</dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}

function BeerValuationResults({ results }: { results: ResultRow[] }) {
  const summaries = summarizeBeerValuations(results[0]?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);
  const formatter = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });

  return (
    <section className={styles.valuationResults} aria-live="polite" aria-label="Beer prices by group">
      <header>
        <div>
          <p className={styles.eyebrow}>Class responses</p>
          <h2>Price by group</h2>
        </div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.valuationComparison}>
        {summaries.map((summary) => (
          <section key={summary.group}>
            <header>
              <span>Group {summary.group}</span>
              <h3>{summary.label}</h3>
              <p>{summary.seller}</p>
            </header>
            <dl>
              <div>
                <dt>Median</dt>
                <dd>{summary.median === null ? "—" : `${formatter.format(summary.median)} NOK`}</dd>
              </div>
              <div>
                <dt>Mean</dt>
                <dd>{summary.mean === null ? "—" : `${formatter.format(summary.mean)} NOK`}</dd>
              </div>
              <div>
                <dt>Responses</dt>
                <dd>{summary.total}</dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}

function EndowmentFramingResults({ results }: { results: ResultRow[] }) {
  const result = results[0];
  const summaries = summarizeEndowmentFramingCounts(result?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);

  return (
    <section className={styles.crewFrameResults} aria-live="polite" aria-label="Choices by condition">
      <header>
        <div>
          <p className={styles.eyebrow}>Class choices</p>
          <h2>Choice by condition</h2>
        </div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.crewFrameComparison}>
        {summaries.map((summary) => (
          <section className={styles.crewFrameGroup} key={summary.condition}>
            <header>
              <div>
                <span>Condition {summary.conditionNumber}</span>
                <h3>{summary.label}</h3>
              </div>
              <strong>n = {summary.total}</strong>
            </header>
            <div className={styles.liveResultChart}>
              {([
                ["Certain option", summary.certain, summary.certainPercentage],
                ["Gamble", summary.gamble, summary.gamblePercentage],
              ] as const).map(([label, count, percentage]) => (
                <div
                  className={styles.liveResultColumn}
                  key={label}
                  aria-label={`Condition ${summary.conditionNumber}, ${label}: ${percentage}% (${count} ${count === 1 ? "response" : "responses"})`}
                >
                  <strong>{percentage}%</strong>
                  <div aria-hidden="true"><i style={{ height: percentage === 0 ? "2px" : `${percentage}%` }} /></div>
                  <span>{label}</span>
                  <em>{count} {count === 1 ? "response" : "responses"}</em>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function CalculatorTripResults({ results }: { results: ResultRow[] }) {
  const result = results[0];
  const summaries = summarizeCalculatorTripCounts(result?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);

  return (
    <section className={styles.crewFrameResults} aria-live="polite" aria-label="Trip decisions by condition">
      <header>
        <div>
          <p className={styles.eyebrow}>Class choices</p>
          <h2>Choice by condition</h2>
        </div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.crewFrameComparison}>
        {summaries.map((summary) => (
          <section className={styles.crewFrameGroup} key={summary.condition}>
            <header>
              <div>
                <span>Condition {summary.conditionNumber}</span>
                <h3>{summary.label}</h3>
              </div>
              <strong>n = {summary.total}</strong>
            </header>
            <div className={styles.liveResultChart}>
              {([
                ["Yes", summary.yes, summary.yesPercentage],
                ["No", summary.no, summary.noPercentage],
              ] as const).map(([label, count, percentage]) => (
                <div
                  className={styles.liveResultColumn}
                  key={label}
                  aria-label={`Condition ${summary.conditionNumber}, ${label}: ${percentage}% (${count} ${count === 1 ? "response" : "responses"})`}
                >
                  <strong>{percentage}%</strong>
                  <div aria-hidden="true"><i style={{ height: percentage === 0 ? "2px" : `${percentage}%` }} /></div>
                  <span>{label}</span>
                  <em>{count} {count === 1 ? "response" : "responses"}</em>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function CrewProblemResults({ results }: { results: ResultRow[] }) {
  const result = results[0];
  const summaries = summarizeCrewProblemCounts(result?.counts ?? {});
  const total = summaries.reduce((sum, summary) => sum + summary.total, 0);

  return (
    <section className={styles.crewFrameResults} aria-live="polite" aria-label="Crew problem results by condition">
      <header>
        <div>
          <p className={styles.eyebrow}>Class choices</p>
          <h2>Choice by framing condition</h2>
        </div>
        <strong>{total} {total === 1 ? "response" : "responses"}</strong>
      </header>
      <div className={styles.crewFrameComparison}>
        {summaries.map((summary) => (
          <section className={styles.crewFrameGroup} key={summary.frame}>
            <header>
              <div>
                <span>Condition {summary.conditionNumber}</span>
                <h3>{summary.label}</h3>
              </div>
              <strong>n = {summary.total}</strong>
            </header>
            <div className={styles.liveResultChart}>
              {([
                ["Certain option", summary.certain, summary.certainPercentage],
                ["Uncertain option", summary.uncertain, summary.uncertainPercentage],
              ] as const).map(([label, count, percentage]) => (
                <div
                  className={styles.liveResultColumn}
                  key={label}
                  aria-label={`${summary.label}, ${label}: ${percentage}% (${count} ${count === 1 ? "response" : "responses"})`}
                >
                  <strong>{percentage}%</strong>
                  <div aria-hidden="true"><i style={{ height: percentage === 0 ? "2px" : `${percentage}%` }} /></div>
                  <span>{label}</span>
                  <em>{count} {count === 1 ? "response" : "responses"}</em>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
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
