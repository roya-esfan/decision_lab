"use client";

import { useMemo, useState } from "react";
import { rei10Items, rei10ResponseLabels } from "@/content/course";
import styles from "../../../course.module.css";

type Answers = Record<string, number>;

function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function ReiQuestionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const item = rei10Items[step];
  const selected = answers[item.id];

  const scores = useMemo(() => {
    if (Object.keys(answers).length !== rei10Items.length) return null;

    const dimensionScore = (dimension: "nfc" | "fi") =>
      mean(
        rei10Items
          .filter((candidate) => candidate.dimension === dimension)
          .map((candidate) => {
            const raw = answers[candidate.id];
            return candidate.reverse ? 6 - raw : raw;
          }),
      );

    return { analytical: dimensionScore("nfc"), intuitive: dimensionScore("fi") };
  }, [answers]);

  function choose(value: number) {
    setAnswers((current) => ({ ...current, [item.id]: value }));
  }

  function next() {
    if (!selected) return;
    if (step === rei10Items.length - 1) {
      setShowResults(true);
      return;
    }
    setStep((current) => current + 1);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setShowResults(false);
  }

  if (showResults && scores) {
    return (
      <section className={styles.reiResults} aria-live="polite" aria-labelledby="results-title">
        <div className={styles.resultLead}>
          <p className={styles.eyebrow}>Your private result</p>
          <h2 id="results-title">Two preferences, not one “type”</h2>
          <p>
            These scores are independent. A stronger preference for analytical
            thinking does not imply weaker intuition, and neither score measures intelligence.
          </p>
        </div>

        <div className={styles.scoreRows}>
          <ScoreRow
            label="Analytical engagement"
            code="NFC"
            score={scores.analytical}
            description="Preference for effortful thought, complexity and cognitive challenge."
          />
          <ScoreRow
            label="Intuitive trust"
            code="FI"
            score={scores.intuitive}
            description="Confidence in hunches, first impressions and gut feelings."
          />
        </div>

        <div className={styles.reflectionPrompt}>
          <span>Discuss</span>
          <p>When might your preferred approach help you make a better decision—and when might it create a blind spot?</p>
        </div>

        <div className={styles.resultActions}>
          <button type="button" onClick={reset}>Retake privately</button>
          <span>No answer or score has left this page.</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.questionnaire} aria-labelledby="question-title">
      <aside className={styles.questionProgress}>
        <div>
          <span>Item</span>
          <strong>{String(step + 1).padStart(2, "0")}</strong>
          <span>/ {rei10Items.length}</span>
        </div>
        <div className={styles.progressLine} aria-label={`Question ${step + 1} of ${rei10Items.length}`}>
          <span style={{ width: `${((step + 1) / rei10Items.length) * 100}%` }} />
        </div>
        <p>Rate how true each statement is for you. There are no right or wrong answers.</p>
      </aside>

      <div className={styles.questionPanel}>
        <p className={styles.eyebrow}>Thinking preference</p>
        <h2 id="question-title">{item.text}</h2>
        <fieldset className={styles.responseScale}>
          <legend>Choose one response</legend>
          {rei10ResponseLabels.map((label, index) => {
            const value = index + 1;
            return (
              <label key={label} className={selected === value ? styles.selectedResponse : undefined}>
                <input
                  type="radio"
                  name={item.id}
                  value={value}
                  checked={selected === value}
                  onChange={() => choose(value)}
                />
                <span>{value}</span>
                <strong>{label}</strong>
              </label>
            );
          })}
        </fieldset>

        <div className={styles.questionActions}>
          <button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Back</button>
          <button className={styles.nextButton} type="button" disabled={!selected} onClick={next}>
            {step === rei10Items.length - 1 ? "See my result" : "Next item"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ScoreRow({
  label,
  code,
  score,
  description,
}: {
  label: string;
  code: string;
  score: number;
  description: string;
}) {
  const rounded = score.toFixed(1);
  return (
    <section className={styles.scoreRow} aria-label={`${label}: ${rounded} out of 5`}>
      <div className={styles.scoreName}><span>{code}</span><h3>{label}</h3></div>
      <div className={styles.scoreTrack} aria-hidden="true"><span style={{ width: `${(score / 5) * 100}%` }} /></div>
      <strong>{rounded}<small>/5</small></strong>
      <p>{description}</p>
    </section>
  );
}
