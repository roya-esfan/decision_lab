import { NextResponse } from "next/server";
import { ApiError, apiFailure } from "@/lib/api";
import { isActivityKey, promptDefinitions } from "@/lib/classroom";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const activityKey = new URL(request.url).searchParams.get("activity");
    if (!isActivityKey(activityKey)) throw new ApiError(400, "Activity not found.");

    const supabase = getSupabaseAdmin();
    const { data: run, error: runError } = await supabase
      .from("classroom_runs")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) return NextResponse.json({ status: "no-run" }, { headers: { "Cache-Control": "no-store" } });

    const { data: activity, error: activityError } = await supabase
      .from("classroom_activity_states")
      .select("is_open, is_revealed")
      .eq("run_id", run.id)
      .eq("activity_key", activityKey)
      .maybeSingle();
    if (activityError) throw activityError;
    if (activity?.is_open || !activity?.is_revealed) {
      return NextResponse.json({ status: "hidden" }, { headers: { "Cache-Control": "no-store" } });
    }

    const promptKeys = promptDefinitions[activityKey].map((item) => item.key);
    const { data: rows, error: responseError } = await supabase
      .from("classroom_responses")
      .select("prompt_key, choice")
      .eq("run_id", run.id)
      .in("prompt_key", promptKeys);
    if (responseError) throw responseError;

    const results = promptDefinitions[activityKey].map((prompt) => {
      const counts = Object.fromEntries(prompt.choices.map((choice) => [choice, 0])) as Record<string, number>;
      for (const row of rows ?? []) {
        if (row.prompt_key === prompt.key && row.choice in counts) counts[row.choice] += 1;
      }
      return { promptKey: prompt.key, label: prompt.label, counts };
    });

    return NextResponse.json({ status: "revealed", results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
