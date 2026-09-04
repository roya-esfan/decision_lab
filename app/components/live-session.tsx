"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityKey } from "@/lib/classroom";
import styles from "../course.module.css";

type SessionState = "loading" | "joining" | "joined" | "closed" | "review" | "unavailable";

export function useLiveSession(activityKey: ActivityKey) {
  const [state, setState] = useState<SessionState>("loading");
  const [runId, setRunId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const joiningRef = useRef(false);

  const joinOpenActivity = useCallback(async () => {
    if (joiningRef.current) return;
    joiningRef.current = true;
    setState("joining");
    setMessage("");
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityKey }),
      });
      const data = await response.json() as { joined?: boolean; runId?: string; error?: string };
      if (!response.ok || !data.joined) throw new Error(data.error ?? "The activity could not be opened.");
      setRunId(data.runId ?? null);
      setState("joined");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The activity could not be opened.");
      setState("unavailable");
    } finally {
      joiningRef.current = false;
    }
  }, [activityKey]);

  const check = useCallback(async () => {
    try {
      const response = await fetch(`/api/session?activity=${activityKey}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as {
        mode?: "closed" | "join" | "live" | "review";
        joined?: boolean;
        runId?: string;
      };
      setRunId(data.runId ?? null);
      if (data.mode === "review") setState("review");
      else if (data.mode === "closed") setState("closed");
      else if (data.joined) setState("joined");
      else await joinOpenActivity();
    } catch {
      setMessage("The live classroom connection is temporarily unavailable.");
      setState("unavailable");
    }
  }, [activityKey, joinOpenActivity]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void check(); }, 0);
    return () => window.clearTimeout(timer);
  }, [check]);

  return { state, runId, message, check };
}

export function LiveSessionGate({
  state,
  message,
  onRetry,
}: {
  state: SessionState;
  message: string;
  onRetry: () => Promise<void>;
}) {
  if (state === "loading" || state === "joining") {
    return <section className={styles.joinPanel}><p>{state === "joining" ? "Preparing the activity…" : "Checking the activity…"}</p></section>;
  }

  if (state === "closed") {
    return (
      <section className={styles.joinPanel} aria-labelledby="join-title">
        <p className={styles.eyebrow}>Activity closed</p>
        <h2 id="join-title">This activity is currently closed</h2>
        <p>The instructor will open it when the class is ready, or enable review mode after the class.</p>
        <button type="button" onClick={() => void onRetry()}>Check again</button>
      </section>
    );
  }

  return (
    <section className={styles.joinPanel} aria-labelledby="join-title">
      <p className={styles.eyebrow}>Connection problem</p>
      <h2 id="join-title">The activity could not be opened</h2>
      <p>{message || "Please try again."}</p>
      <button type="button" onClick={() => void onRetry()}>Try again</button>
    </section>
  );
}
