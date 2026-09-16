"use client";

import { useRef, useState } from "react";
import { LiveResults } from "../../../components/live-results";
import { LiveSessionGate, useLiveSession } from "../../../components/live-session";
import { fetchWithTransientRetry } from "@/lib/client-fetch";
import {
  encodeLandDisputeDecision,
  type LandDisputeDecision,
  type LandDisputeGroup,
} from "@/lib/land-dispute";
import sharedStyles from "../../../course.module.css";
import styles from "./land-dispute.module.css";

export function LandDisputeActivity() {
  const session = useLiveSession("land-dispute");
  const idempotencyKey = useRef<string | null>(null);
  const [group, setGroup] = useState<LandDisputeGroup | null>(null);
  const [decision, setDecision] = useState<LandDisputeDecision | null>(null);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  if (session.state !== "joined" && session.state !== "review") {
    return <LiveSessionGate state={session.state} message={session.message} onRetry={session.check} />;
  }

  if (!group) {
    return (
      <section className={styles.groupPicker} aria-labelledby="group-title">
        <h2 id="group-title">Choose the group assigned to you</h2>
        <div role="group" aria-label="Choose Group A or Group B">
          <button type="button" onClick={() => setGroup("plaintiff")}><strong>Group A</strong><span>Plaintiff</span></button>
          <button type="button" onClick={() => setGroup("defendant")}><strong>Group B</strong><span>Defendant</span></button>
        </div>
      </section>
    );
  }

  async function submit() {
    if (!group || !decision) return;
    if (session.state === "review") {
      setComplete(true);
      return;
    }

    idempotencyKey.current ??= crypto.randomUUID();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetchWithTransientRetry("/api/responses/land-dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          responses: [
            { promptKey: "land-dispute-choice", choice: encodeLandDisputeDecision(group, decision) },
          ],
        }),
      });
      const data = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !data.accepted) throw new Error(data.error ?? "Your response could not be submitted.");
      setComplete(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Your response could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <section className={styles.complete} aria-live="polite">
        <p>{session.state === "review" ? "Review complete" : "Response recorded"}</p>
        <h2>{session.state === "review" ? `You chose ${decision?.toUpperCase()}` : "Thank you"}</h2>
        {session.state === "review" ? (
          <div className={sharedStyles.reviewResults}>
            <header><p className={sharedStyles.eyebrow}>From the classroom session</p><h2>Class results</h2></header>
            <LiveResults activityKey="land-dispute" />
          </div>
        ) : <p className={sharedStyles.submissionStatus}>Class results will be discussed together.</p>}
      </section>
    );
  }

  return (
    <section className={styles.activity} aria-labelledby="case-heading">
      <header className={styles.caseHeader}>
        <p>Group {group === "plaintiff" ? "A" : "B"}</p>
        <h2 id="case-heading">{group === "plaintiff" ? "Plaintiff" : "Defendant"}</h2>
      </header>

      <article className={styles.caseText}>
        {group === "plaintiff" ? <PlaintiffCase /> : <DefendantCase />}
      </article>

      <section className={styles.response} aria-labelledby="recommendation-question">
        <h2 id="recommendation-question">
          {group === "plaintiff"
            ? "Would you recommend accepting the $70,000 settlement?"
            : "Would you recommend paying the $70,000 settlement?"}
        </h2>
        <div className={styles.decisionOptions} role="group" aria-label="Choose Yes or No">
          {(["yes", "no"] as const).map((option) => (
            <button
              className={decision === option ? styles.selectedDecision : undefined}
              type="button"
              key={option}
              onClick={() => setDecision(option)}
            >{option.toUpperCase()}</button>
          ))}
        </div>
        <p className={styles.whyPrompt}>Why?</p>
        <div className={styles.submitRow}>
          <button type="button" disabled={!decision || submitting} onClick={() => void submit()}>
            {submitting ? "Submitting…" : "Submit response"}
          </button>
        </div>
        {submissionError && <p className={sharedStyles.formError} role="alert">{submissionError}</p>}
      </section>
    </section>
  );
}

function PlaintiffCase() {
  return (
    <>
      <p>Imagine that you are an attorney at a large law firm. You represent the plaintiff, Tom Smith, in a land dispute.</p>
      <p>Mr. Smith owns a large piece of property in Oregon, where he has built a vacation home. During a recent vacation, he discovered that the neighboring bed-and-breakfast had expanded. A new set of rooms had been added on a small corner of his property. The neighboring business, Real Resorts, Inc., is a small chain of bed-and-breakfast inns.</p>
      <p>Your client has asked you to file a lawsuit against Real Resorts.</p>
      <p>It turns out that your client is correct. Some of the new rooms have been built partly on a section of his property measuring approximately 30 feet by 10 feet. Real Resorts does not dispute this fact and acknowledges that the rooms were mistakenly built on your client&apos;s land.</p>
      <p>You and Real Resorts also agree that your client&apos;s land has suffered only a very small reduction in value as a result of losing the use of this small part of the property.</p>
      <p>Under Oregon law, as in most states, Real Resorts has trespassed on your client&apos;s land, and the trespass is continuing.</p>
      <p>The judge assigned to the case will have a choice between two legal remedies:</p>
      <ol>
        <li>Order Real Resorts to remove the part of the building that is on your client&apos;s property; or</li>
        <li>Order your client to sell that small piece of property to Real Resorts for its actual value, which is approximately $50.</li>
      </ol>
      <p>From previous discussions with Real Resorts, you know that if the judge orders the company to remove the building, Real Resorts would rather buy the land than tear down the new rooms.</p>
      <p>Real Resorts has indicated that, if this happens, it will offer your client $100,000 for the piece of land. You are confident that your client would accept that amount.</p>
      <p>In other words, depending on the judge&apos;s decision, your client will receive either approximately:</p>
      <ul><li>$100,000, or</li><li>$50</li></ul>
      <p>for this small piece of property. Your client will, of course, keep the rest of his land.</p>
      <p>You have consulted a senior partner at your law firm who knows the judge personally and has tried property-rights cases before her. Based on his knowledge of the judge, he estimates that there is approximately a 70% chance that the judge will rule in your client&apos;s favor and order Real Resorts to remove the building.</p>
      <p>Your client has told you that if he loses before the judge, he does not want to incur the expense of an appeal. He will end the case.</p>
      <p>It is now one day before the trial.</p>
      <p>Real Resorts has contacted you and offered to settle the case by paying your client $70,000.</p>
      <p>Real Resorts states that this is a final, non-negotiable offer.</p>
    </>
  );
}

function DefendantCase() {
  return (
    <>
      <p>Imagine that you are an attorney at a large law firm. You represent the defendant, Real Resorts, Inc., a small chain of bed-and-breakfast inns, in a land dispute.</p>
      <p>Your client recently expanded one of its inns in Oregon by adding several new rooms and buildings.</p>
      <p>Because of an error by a surveying company, a small but expensive part of the new construction was accidentally built on a 30-foot by 10-foot section of a neighboring property. That property belongs to Tom Smith, who has a vacation home there.</p>
      <p>The surveying company has since filed for bankruptcy, so there is no realistic possibility of receiving compensation from the surveying company for its error.</p>
      <p>Tom Smith has filed a lawsuit against your client, asking the court to order Real Resorts to remove the new rooms.</p>
      <p>It turns out that the plaintiff is correct. Some of the new rooms have been built partly on his property. Your client does not dispute this fact and acknowledges that the rooms were mistakenly built on the plaintiff&apos;s land.</p>
      <p>You and the plaintiff also agree that his land has suffered only a very small reduction in value as a result of losing the use of this small part of the property.</p>
      <p>Under Oregon law, as in most states, Real Resorts has trespassed on the plaintiff&apos;s land, and the trespass is continuing.</p>
      <p>The judge assigned to the case will have a choice between two legal remedies:</p>
      <ol>
        <li>Order your client, Real Resorts, to remove the part of the building that is on the plaintiff&apos;s property; or</li>
        <li>Order the plaintiff to sell that small piece of property to your client for its actual value, which is approximately $50.</li>
      </ol>
      <p>You know that if the judge orders Real Resorts to remove the building, your client would rather buy the land than tear down the new rooms.</p>
      <p>Your client has decided that, if the judge orders the building removed, it will offer the plaintiff $100,000 for the piece of land. You are confident that the plaintiff would accept that amount.</p>
      <p>In other words, depending on the judge&apos;s decision, your client will face a payment of either approximately:</p>
      <ul><li>$100,000, or</li><li>$50</li></ul>
      <p>for this small piece of property.</p>
      <p>You have consulted a senior partner at your law firm who knows the judge personally and has tried property-rights cases before her. Based on his knowledge of the judge, he estimates that there is approximately a 70% chance that the judge will rule against your client and order Real Resorts to remove the building.</p>
      <p>Your client has told you that if it loses before the judge, it does not want to incur the expense of an appeal.</p>
      <p>It is now one day before the trial.</p>
      <p>The plaintiff has contacted you and said that he is willing to settle the case if your client pays him $70,000.</p>
      <p>The plaintiff states that this is a final, non-negotiable offer.</p>
    </>
  );
}
