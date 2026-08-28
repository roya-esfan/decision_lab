"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../../course.module.css";

export function MagicLinkConfirmation() {
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const authError = params.get("error_description");
      window.history.replaceState(null, "", window.location.pathname);

      if (authError || !accessToken) {
        setError(authError ?? "The sign-in link is incomplete or has expired.");
        return;
      }

      try {
        const response = await fetch("/api/instructor/auth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        const data = await response.json() as { authenticated?: boolean; error?: string };
        if (!response.ok || !data.authenticated) throw new Error(data.error ?? "The sign-in link could not be verified.");
        window.location.replace("/instructor");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "The sign-in link could not be verified.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <section className={styles.controlEmpty}>
        <p className={styles.eyebrow}>Sign-in unsuccessful</p>
        <h2>Please request a new link</h2>
        <p>{error}</p>
        <Link className={styles.primaryLink} href="/instructor">Return to instructor sign-in</Link>
      </section>
    );
  }

  return <section className={styles.controlEmpty}><p>Verifying your secure sign-in link…</p></section>;
}
