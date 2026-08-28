"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../course.module.css";

type SessionState = "loading" | "joined" | "not-joined" | "unavailable";

export function useLiveSession() {
  const [state, setState] = useState<SessionState>("loading");
  const [runId, setRunId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const check = useCallback(async () => {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { joined?: boolean; runId?: string };
      setRunId(data.runId ?? null);
      setState(data.joined ? "joined" : "not-joined");
    } catch {
      setMessage("The live classroom connection is temporarily unavailable.");
      setState("unavailable");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void check(); }, 0);
    return () => window.clearTimeout(timer);
  }, [check]);

  async function join(code: string) {
    setMessage("");
    const response = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json() as { joined?: boolean; runId?: string; error?: string };
    if (!response.ok || !data.joined) {
      setMessage(data.error ?? "The class code could not be accepted.");
      return false;
    }
    setRunId(data.runId ?? null);
    setState("joined");
    return true;
  }

  return { state, runId, message, join };
}

export function LiveSessionGate({
  state,
  message,
  onJoin,
}: {
  state: SessionState;
  message: string;
  onJoin: (code: string) => Promise<boolean>;
}) {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  if (state === "loading") {
    return <section className={styles.joinPanel}><p>Checking the live classroom session…</p></section>;
  }

  return (
    <section className={styles.joinPanel} aria-labelledby="join-title">
      <p className={styles.eyebrow}>Live classroom</p>
      <h2 id="join-title">Enter the class code</h2>
      <p>The instructor will show an eight-character code when joining opens.</p>
      <form onSubmit={async (event) => {
        event.preventDefault();
        setJoining(true);
        await onJoin(code);
        setJoining(false);
      }}>
        <label>
          <span>Class code</span>
          <input
            autoCapitalize="characters"
            autoComplete="off"
            inputMode="text"
            maxLength={8}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))}
            placeholder="ABCD2345"
          />
        </label>
        <button type="submit" disabled={joining || code.length !== 8}>{joining ? "Joining…" : "Join session"}</button>
      </form>
      {message && <p className={styles.joinError} role="alert">{message}</p>}
    </section>
  );
}
