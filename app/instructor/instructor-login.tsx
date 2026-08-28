"use client";

import { useState } from "react";
import styles from "../course.module.css";

export function InstructorLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestLink() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/instructor/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The sign-in link could not be sent.");
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The sign-in link could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) return (
    <section className={styles.instructorLogin} aria-live="polite">
      <div><span>02</span><h2>Check your email</h2><p>Open the secure link from Supabase to continue to the classroom control page.</p></div>
      <div className={styles.magicLinkSent}>
        <strong>{email}</strong>
        <p>The link can be used once and may take a moment to arrive.</p>
        <button className={styles.textButton} type="button" onClick={() => { setSent(false); setError(""); }}>Use another email</button>
      </div>
    </section>
  );

  return (
    <section className={styles.instructorLogin} aria-labelledby="login-title">
      <div>
        <span>01</span>
        <h2 id="login-title">Sign in by email</h2>
        <p>Only configured instructor addresses can access this page.</p>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); void requestLink(); }}>
        <label>
          <span>Instructor email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send secure sign-in link"}</button>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
    </section>
  );
}
