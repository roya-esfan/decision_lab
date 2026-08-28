"use client";

import { useState } from "react";
import styles from "../course.module.css";

export function InstructorLogin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/instructor/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The sign-in code could not be sent.");
      setStage("code");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The sign-in code could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/instructor/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json() as { authenticated?: boolean; error?: string };
      if (!response.ok || !data.authenticated) throw new Error(data.error ?? "The sign-in code could not be verified.");
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The sign-in code could not be verified.");
      setBusy(false);
    }
  }

  return (
    <section className={styles.instructorLogin} aria-labelledby="login-title">
      <div>
        <span>01</span>
        <h2 id="login-title">Sign in by email</h2>
        <p>Only configured instructor addresses can access this page.</p>
      </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (stage === "email") void requestCode();
        else void verifyCode();
      }}>
        <label>
          <span>Instructor email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={stage === "code"} required />
        </label>
        {stage === "code" && (
          <label>
            <span>Email code</span>
            <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 10))} required />
          </label>
        )}
        <button type="submit" disabled={busy}>{busy ? "Please wait…" : stage === "email" ? "Send sign-in code" : "Sign in"}</button>
        {stage === "code" && <button className={styles.textButton} type="button" onClick={() => { setStage("email"); setCode(""); setError(""); }}>Use another email</button>}
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
    </section>
  );
}
