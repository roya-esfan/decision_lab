"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../../../course.module.css";

const offers = [
  { id: "equal", offered: 50, kept: 50 },
  { id: "low", offered: 20, kept: 80 },
  { id: "minimal", offered: 2, kept: 98 },
] as const;

type Decision = "accept" | "reject";

export function BargainActivity() {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [complete, setComplete] = useState(false);
  const offer = offers[index];
  const selected = decisions[offer.id];

  function choose(decision: Decision) {
    setDecisions((current) => ({ ...current, [offer.id]: decision }));
  }

  function next() {
    if (!selected) return;
    if (index < offers.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    const finished = { ...decisions, [offer.id]: selected };
    window.localStorage.setItem("decision-lab:day1:bargain", JSON.stringify(finished));
    setComplete(true);
  }

  function restart() {
    window.localStorage.removeItem("decision-lab:day1:bargain");
    setDecisions({});
    setIndex(0);
    setComplete(false);
  }

  if (complete) {
    return (
      <section className={styles.bargainComplete} aria-live="polite">
        <p className={styles.eyebrow}>Response complete</p>
        <h2>Your three decisions are ready.</h2>
        <p>
          Your choices are saved only on this device for now. Class collection
          and the instructor reveal control will be activated when the live
          Supabase session is connected.
        </p>
        <div className={styles.decisionSummary}>
          {offers.map((item) => (
            <div key={item.id}>
              <span>{item.offered} / {item.kept}</span>
              <strong>{decisions[item.id]}</strong>
            </div>
          ))}
        </div>
        <div className={styles.resultActions}>
          <Link href="/day/1/assignment-1/results">Class results when revealed</Link>
          <button type="button" onClick={restart}>Start again</button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.bargainQuestion} aria-labelledby="offer-title">
      <aside>
        <p>Offer</p>
        <strong>{String(index + 1).padStart(2, "0")}</strong>
        <span>of {offers.length}</span>
      </aside>
      <div>
        <p className={styles.eyebrow}>Eve proposes</p>
        <h2 id="offer-title">
          Eve offers you <em>{offer.offered} kr</em> and keeps {offer.kept} kr.
        </h2>
        <p className={styles.decisionPrompt}>Would you accept or reject the offer?</p>
        <div className={styles.decisionButtons} role="group" aria-label="Choose whether to accept or reject">
          <button
            className={selected === "accept" ? styles.selectedDecision : undefined}
            type="button"
            onClick={() => choose("accept")}
            aria-pressed={selected === "accept"}
          >
            Accept
          </button>
          <button
            className={selected === "reject" ? styles.selectedDecision : undefined}
            type="button"
            onClick={() => choose("reject")}
            aria-pressed={selected === "reject"}
          >
            Reject
          </button>
        </div>
        <div className={styles.questionActions}>
          <button type="button" onClick={() => setIndex((current) => current - 1)} disabled={index === 0}>Back</button>
          <button className={styles.nextButton} type="button" onClick={next} disabled={!selected}>
            {index === offers.length - 1 ? "Finish" : "Next offer"}
          </button>
        </div>
      </div>
    </section>
  );
}
