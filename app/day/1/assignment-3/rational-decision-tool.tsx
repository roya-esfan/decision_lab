"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import styles from "../../../course.module.css";

type NamedItem = { id: string; name: string };

const stepNames = [
  "Define the problem",
  "Identify criteria",
  "Weigh criteria",
  "Generate alternatives",
  "Rate alternatives",
  "Compute the decision",
] as const;

export function RationalDecisionTool() {
  const nextId = useRef(1);
  const [step, setStep] = useState(1);
  const [problem, setProblem] = useState("");
  const [criteria, setCriteria] = useState<NamedItem[]>([]);
  const [criterionDraft, setCriterionDraft] = useState("");
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [alternatives, setAlternatives] = useState<NamedItem[]>([]);
  const [alternativeDraft, setAlternativeDraft] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  const weightTotal = criteria.reduce((total, criterion) => total + (weights[criterion.id] ?? 0), 0);

  const rankedAlternatives = useMemo(() => {
    return alternatives
      .map((alternative) => ({
        ...alternative,
        score: criteria.reduce((total, criterion) => {
          const weight = (weights[criterion.id] ?? 0) / 100;
          const rating = ratings[`${alternative.id}:${criterion.id}`] ?? 0;
          return total + weight * rating;
        }, 0),
      }))
      .sort((a, b) => b.score - a.score);
  }, [alternatives, criteria, ratings, weights]);

  function addNamedItem(
    event: FormEvent,
    draft: string,
    kind: "criterion" | "alternative",
  ) {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return;
    const item = { id: `${kind}-${nextId.current++}`, name };

    if (kind === "criterion") {
      setCriteria((current) => [...current, item]);
      setCriterionDraft("");
    } else {
      setAlternatives((current) => [...current, item]);
      setAlternativeDraft("");
    }
    setError("");
  }

  function removeCriterion(id: string) {
    setCriteria((current) => current.filter((item) => item.id !== id));
    setWeights((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setRatings((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.endsWith(`:${id}`))));
  }

  function removeAlternative(id: string) {
    setAlternatives((current) => current.filter((item) => item.id !== id));
    setRatings((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${id}:`))));
  }

  function validateStep() {
    if (step === 1 && problem.trim().length < 3) return "Write a short description of the problem before continuing.";
    if (step === 2 && criteria.length < 2) return "Add at least two criteria before continuing.";
    if (step === 3 && criteria.some((criterion) => (weights[criterion.id] ?? 0) < 0 || (weights[criterion.id] ?? 0) > 100)) return "Each criterion weight must be between 0% and 100%.";
    if (step === 3 && Math.abs(weightTotal - 100) > 0.001) return `The criteria must total exactly 100%. Your current total is ${weightTotal}%.`;
    if (step === 4 && alternatives.length < 2) return "Add at least two alternatives before continuing.";
    if (step === 5) {
      const missing = alternatives.some((alternative) =>
        criteria.some((criterion) => ratings[`${alternative.id}:${criterion.id}`] === undefined),
      );
      if (missing) return "Rate every alternative on every criterion before continuing.";
    }
    return "";
  }

  function nextStep() {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    setError("");
    if (step === 5) {
      window.localStorage.setItem(
        "decision-lab:day1:rational-decision",
        JSON.stringify({ problem, criteria, weights, alternatives, ratings }),
      );
    }
    setStep((current) => Math.min(6, current + 1));
  }

  function restart() {
    window.localStorage.removeItem("decision-lab:day1:rational-decision");
    setStep(1);
    setProblem("");
    setCriteria([]);
    setCriterionDraft("");
    setWeights({});
    setAlternatives([]);
    setAlternativeDraft("");
    setRatings({});
    setError("");
  }

  return (
    <section className={styles.decisionTool} aria-labelledby="decision-step-title">
      <ol className={styles.stepRail} aria-label="Six-step decision process">
        {stepNames.map((name, index) => (
          <li className={step === index + 1 ? styles.currentStep : step > index + 1 ? styles.completedStep : undefined} key={name}>
            <span>{String(index + 1).padStart(2, "0")}</span>{name}
          </li>
        ))}
      </ol>

      <div className={styles.decisionStep}>
        <p className={styles.eyebrow}>Step {step} of 6</p>
        <h2 id="decision-step-title">{stepNames[step - 1]}</h2>

        {step === 1 && (
          <label className={styles.fieldBlock}>
            <span>What decision or problem are you working on?</span>
            <textarea value={problem} onChange={(event) => setProblem(event.target.value)} maxLength={500} rows={5} placeholder="Describe the problem in one or two sentences." />
          </label>
        )}

        {step === 2 && (
          <>
            <p className={styles.stepInstruction}>What matters when judging a good solution?</p>
            <ItemBuilder value={criterionDraft} onChange={setCriterionDraft} onSubmit={(event) => addNamedItem(event, criterionDraft, "criterion")} label="Add a criterion" placeholder="For example: cost" />
            <ItemChips items={criteria} onRemove={removeCriterion} empty="No criteria added yet." />
          </>
        )}

        {step === 3 && (
          <>
            <p className={styles.stepInstruction}>Distribute 100% across your criteria according to their importance.</p>
            <div className={styles.weightList}>
              {criteria.map((criterion) => (
                <label key={criterion.id}>
                  <span>{criterion.name}</span>
                  <span><input type="number" min="0" max="100" step="1" value={weights[criterion.id] ?? ""} onChange={(event) => setWeights((current) => ({ ...current, [criterion.id]: Number(event.target.value) }))} />%</span>
                </label>
              ))}
            </div>
            <div className={weightTotal === 100 ? styles.validTotal : styles.invalidTotal} aria-live="polite">
              <span>Total</span><strong>{weightTotal}%</strong><em>{weightTotal === 100 ? "Ready" : `${100 - weightTotal}% remaining`}</em>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className={styles.stepInstruction}>List the realistic solutions or courses of action you could choose.</p>
            <ItemBuilder value={alternativeDraft} onChange={setAlternativeDraft} onSubmit={(event) => addNamedItem(event, alternativeDraft, "alternative")} label="Add an alternative" placeholder="For example: Solution A" />
            <ItemChips items={alternatives} onRemove={removeAlternative} empty="No alternatives added yet." />
          </>
        )}

        {step === 5 && (
          <>
            <p className={styles.stepInstruction}>Rate how well each alternative achieves each criterion, from 1 to 10.</p>
            <RatingMatrix alternatives={alternatives} criteria={criteria} ratings={ratings} />
            <div className={styles.ratingQuestions}>
              {alternatives.flatMap((alternative) => criteria.map((criterion) => {
                const key = `${alternative.id}:${criterion.id}`;
                return (
                  <label key={key}>
                    <span>From 1 to 10, how well will <strong>{alternative.name}</strong> achieve <strong>{criterion.name}</strong>?</span>
                    <input type="number" min="1" max="10" step="1" value={ratings[key] ?? ""} onChange={(event) => {
                      const value = Number(event.target.value);
                      setRatings((current) => ({ ...current, [key]: Math.max(1, Math.min(10, value)) }));
                    }} />
                  </label>
                );
              }))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <p className={styles.stepInstruction}>Each rating is multiplied by its criterion weight. The weighted ratings are then added for each alternative.</p>
            <div className={styles.decisionOutcome}>
              <p>Highest weighted score</p>
              <h3>{rankedAlternatives[0]?.name}</h3>
              <strong>{rankedAlternatives[0]?.score.toFixed(2)} <small>/ 10</small></strong>
            </div>
            <div className={styles.rankingTable} role="table" aria-label="Ranked alternatives">
              <div role="row"><span role="columnheader">Rank</span><span role="columnheader">Alternative</span><span role="columnheader">Weighted score</span></div>
              {rankedAlternatives.map((alternative, index) => (
                <div role="row" key={alternative.id}><span role="cell">{index + 1}</span><strong role="cell">{alternative.name}</strong><span role="cell">{alternative.score.toFixed(2)}</span></div>
              ))}
            </div>
          </>
        )}

        {error && <p className={styles.formError} role="alert">{error}</p>}

        <div className={styles.toolActions}>
          {step > 1 && <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }}>Back</button>}
          {step < 6 ? <button className={styles.nextButton} type="button" onClick={nextStep}>Continue</button> : <button className={styles.nextButton} type="button" onClick={restart}>Start a new decision</button>}
        </div>
      </div>
    </section>
  );
}

function ItemBuilder({ value, onChange, onSubmit, label, placeholder }: { value: string; onChange: (value: string) => void; onSubmit: (event: FormEvent) => void; label: string; placeholder: string }) {
  return (
    <form className={styles.itemBuilder} onSubmit={onSubmit}>
      <label><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} maxLength={80} placeholder={placeholder} /></label>
      <button type="submit">Add</button>
    </form>
  );
}

function ItemChips({ items, onRemove, empty }: { items: NamedItem[]; onRemove: (id: string) => void; empty: string }) {
  if (items.length === 0) return <p className={styles.emptyItems}>{empty}</p>;
  return <ul className={styles.itemChips}>{items.map((item) => <li key={item.id}><span>{item.name}</span><button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>×</button></li>)}</ul>;
}

function RatingMatrix({ alternatives, criteria, ratings }: { alternatives: NamedItem[]; criteria: NamedItem[]; ratings: Record<string, number> }) {
  return (
    <div className={styles.matrixScroll}>
      <table className={styles.ratingMatrix}>
        <thead><tr><th>Alternative</th>{criteria.map((criterion) => <th key={criterion.id}>{criterion.name}</th>)}</tr></thead>
        <tbody>{alternatives.map((alternative) => <tr key={alternative.id}><th>{alternative.name}</th>{criteria.map((criterion) => <td key={criterion.id}>{ratings[`${alternative.id}:${criterion.id}`] ?? "—"}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
