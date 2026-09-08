"use client";

import { useRef, useState } from "react";
import { companyRevenueGroups } from "@/lib/day-two-activities";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import sharedStyles from "../../../course.module.css";
import styles from "../day-two-activities.module.css";

type Group = keyof typeof companyRevenueGroups;

export function CompanyRevenueChoice() {
  const session = useLiveSession("company-revenue");
  const idempotencyKey = useRef<string | null>(null);
  const [choice, setChoice] = useState<Group | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  async function choose(group: Group) {
    if (session.state === "review") {
      setChoice(group);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/responses/company-revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [{ promptKey: "company-revenue-group", choice: `Group ${group}` }],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) {
        throw new Error(data.error ?? "Your response could not be submitted.");
      }
      setChoice(group);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your response could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (choice) {
    return (
      <section className={styles.activityComplete} aria-live="polite">
        <p className={styles.eyebrow}>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>You chose Group {choice}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header>
              <p className={sharedStyles.eyebrow}>From the classroom session</p>
              <h2>Class results</h2>
            </header>
            <LiveResults activityKey="company-revenue" />
          </div>
        ) : (
          <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.companyActivity} aria-labelledby="company-question">
      <h2 id="company-question">Which group had the larger total sales revenue in 2003?</h2>
      <div className={styles.companyGroups}>
        {(Object.entries(companyRevenueGroups) as [Group, readonly string[]][]).map(([group, companies]) => (
          <section key={group}>
            <header><span>Group</span><strong>{group}</strong></header>
            <ul>{companies.map((company) => <li key={company}>{company}</li>)}</ul>
            <button type="button" disabled={submitting} onClick={() => void choose(group)}>
              Choose Group {group}
            </button>
          </section>
        ))}
      </div>
      {submitting && <p className={sharedStyles.submissionStatus}>Submitting your response…</p>}
      {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
    </section>
  );
}
