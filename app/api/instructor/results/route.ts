import { NextResponse } from "next/server";
import { ApiError, apiFailure } from "@/lib/api";
import { isActivityKey, promptDefinitions } from "@/lib/classroom";
import { requireInstructor } from "@/lib/instructor-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireInstructor();
    const searchParams = new URL(request.url).searchParams;
    const runId = searchParams.get("run");
    const activityKey = searchParams.get("activity");
    if (!runId || !uuidPattern.test(runId) || !isActivityKey(activityKey)) throw new ApiError(400, "Results request is invalid.");

    const promptKeys = promptDefinitions[activityKey].map((item) => item.key);
    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from("classroom_responses")
      .select("prompt_key, choice")
      .eq("run_id", runId)
      .in("prompt_key", promptKeys);
    if (error) throw error;

    const results = promptDefinitions[activityKey].map((prompt) => {
      const counts = Object.fromEntries(prompt.choices.map((choice) => [choice, 0])) as Record<string, number>;
      for (const row of rows ?? []) {
        if (row.prompt_key === prompt.key) counts[row.choice] = (counts[row.choice] ?? 0) + 1;
      }
      return { promptKey: prompt.key, label: prompt.label, counts };
    });

    let explanations: Array<{ submissionId: string; group: string; decision: string; text: string; createdAt: string }> = [];
    if (activityKey === "land-dispute") {
      const { data: responseRows, error: responseError } = await supabase
        .from("classroom_responses")
        .select("submission_id, prompt_key, choice, created_at")
        .eq("run_id", runId)
        .in("prompt_key", ["land-dispute-choice", "land-dispute-explanation"])
        .order("created_at", { ascending: false });
      if (responseError) throw responseError;

      const grouped = new Map<string, { submissionId: string; group: string; decision: string; text: string; createdAt: string }>();
      for (const row of responseRows ?? []) {
        const current = grouped.get(row.submission_id) ?? {
          submissionId: row.submission_id,
          group: "",
          decision: "",
          text: "",
          createdAt: row.created_at,
        };
        if (row.prompt_key === "land-dispute-choice") {
          const [group, decision] = row.choice.split(":", 2);
          current.group = group;
          current.decision = decision;
        } else {
          current.text = row.choice;
        }
        grouped.set(row.submission_id, current);
      }
      explanations = Array.from(grouped.values()).filter((item) => item.group && item.decision && item.text);
    }

    return NextResponse.json({ results, explanations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
