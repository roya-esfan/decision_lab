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
        if (row.prompt_key === prompt.key && row.choice in counts) counts[row.choice] += 1;
      }
      return { promptKey: prompt.key, label: prompt.label, counts };
    });
    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
