import type { PrivateActivityKey } from "@/lib/private-activities";

export async function recordAnonymousCompletion(activityKey: PrivateActivityKey) {
  try {
    await fetch(`/api/completions/${activityKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      keepalive: true,
    });
  } catch {
    // Completion tracking is optional and must never interrupt the activity.
  }
}
