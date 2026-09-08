"use client";

import { useEffect, useState } from "react";
import { rei10Items, rei10ResponseLabels, type ReiItem } from "@/content/course";
import { scoreRei10, type ReiAnswers } from "@/lib/rei-scoring";
import { recordAnonymousCompletion } from "./anonymous-completion";
import styles from "../course.module.css";

function shuffle<T>(items: readonly T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function createQuestionOrder(): ReiItem[] {
  const analytical = shuffle(rei10Items.filter((item) => item.dimension === "nfc"));
  const intuitive = shuffle(rei10Items.filter((item) => item.dimension === "fi"));
  const startWithAnalytical = Math.random() >= 0.5;

  return analytical.flatMap((analyticalItem, index) =>
    startWithAnalytical
      ? [analyticalItem, intuitive[index]]
      : [intuitive[index], analyticalItem],
  );
}

export function ReiQuestionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ReiAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [orderedItems, setOrderedItems] = useState<ReiItem[]>([]);
  const item = orderedItems[step];
  const selected = item ? answers[item.id] : undefined;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOrderedItems(createQuestionOrder());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const scores = scoreRei10(answers, rei10Items);

  function choose(value: number) {
    if (!item) return;
    setAnswers((current) => ({ ...current, [item.id]: value }));
  }

  function next() {
    if (!selected) return;
    if (step === orderedItems.length - 1) {
      setShowResults(true);
      void recordAnonymousCompletion("rei-10");
      return;
    }
    setStep((current) => current + 1);
  }

  if (showResults && scores) {
    return (
      <section className={styles.reiResults} aria-live="polite" aria-labelledby="results-title">
        <div className={styles.resultLead}>
          <p className={styles.eyebrow}>Your private result</p>
          <h2 id="results-title">Your cognitive style</h2>
        </div>

        <div className={styles.scoreRows}>
          <ScoreRow
            label="Need for Cognition"
            code="NFC"
            score={scores.analytical}
            mode="Analytic-rational thinking"
            description="NFC reflects how much you tend to enjoy thinking deeply and engaging with mentally challenging tasks. People with higher scores typically report enjoying complex problems and putting effort into thinking things through."
          />
          <ScoreRow
            label="Faith in Intuition"
            code="FI"
            score={scores.intuitive}
            mode="Intuitive-experiential thinking"
            description="FI reflects how much you tend to trust your feelings, hunches and immediate impressions when making judgments and decisions. People with higher scores generally place more confidence in these intuitive impressions."
          />
        </div>

      </section>
    );
  }

  if (!item) {
    return (
      <section className={styles.questionnaireLoading} aria-live="polite">
        Preparing the questions…
      </section>
    );
  }

  return (
    <section className={styles.questionnaire} aria-labelledby="question-title">
      <aside className={styles.questionProgress}>
        <div>
          <span>Item</span>
          <strong>{String(step + 1).padStart(2, "0")}</strong>
          <span>/ {orderedItems.length}</span>
        </div>
        <div className={styles.progressLine} aria-label={`Question ${step + 1} of ${orderedItems.length}`}>
          <span style={{ width: `${((step + 1) / orderedItems.length) * 100}%` }} />
        </div>
        <p>Rate how true each statement is for you. There are no right or wrong answers.</p>
      </aside>

      <div className={styles.questionPanel}>
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
            {step === orderedItems.length - 1 ? "See my result" : "Next item"}
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
  mode,
  description,
}: {
  label: string;
  code: string;
  score: number;
  mode: string;
  description: string;
}) {
  const rounded = score.toFixed(1);
  return (
    <section className={styles.scoreRow} aria-label={`${label}: ${rounded} out of 5`}>
      <div className={styles.scoreName}><span>{code}</span><h3>{label}</h3><p>{mode}</p></div>
      <div className={styles.scoreTrack} aria-hidden="true"><span style={{ width: `${(score / 5) * 100}%` }} /></div>
      <strong>{rounded}<small>/5</small></strong>
      <p>{description}</p>
    </section>
  );
}
