import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { isActivityKey } from "@/lib/classroom";
import { requireInstructor } from "@/lib/instructor-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireInstructor();
    const { id } = await context.params;
    if (!uuidPattern.test(id)) throw new ApiError(404, "Classroom session not found.");
    const body = await readJson(request, 1024);
    if (!body || typeof body !== "object" || !("action" in body) || typeof body.action !== "string") {
      throw new ApiError(400, "Unknown classroom action.");
    }

    const supabase = getSupabaseAdmin();
    if (body.action === "close-run") {
      const { error } = await supabase.from("classroom_runs").update({ state: "closed", joins_open: false }).eq("id", id);
      if (error) throw error;
      const { error: activityError } = await supabase.from("classroom_activity_states").update({ is_open: false, is_revealed: false }).eq("run_id", id);
      if (activityError) throw activityError;
    } else if (body.action === "reset-run") {
      const { data: targetRun, error: targetError } = await supabase
        .from("classroom_runs")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!targetRun) throw new ApiError(404, "Classroom session not found.");

      const { data: otherActiveRun, error: otherRunError } = await supabase
        .from("classroom_runs")
        .select("id")
        .neq("id", id)
        .eq("state", "open")
        .gt("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();
      if (otherRunError) throw otherRunError;
      if (otherActiveRun) throw new ApiError(409, "Another classroom session is currently active.");

      const { error: lockError } = await supabase
        .from("classroom_runs")
        .update({ state: "closed", joins_open: false })
        .eq("id", id);
      if (lockError) throw lockError;

      const { error: stateError } = await supabase
        .from("classroom_activity_states")
        .update({ is_open: false, is_revealed: false, updated_at: new Date().toISOString() })
        .eq("run_id", id);
      if (stateError) throw stateError;

      const { error: participantError } = await supabase
        .from("classroom_participants")
        .delete()
        .eq("run_id", id);
      if (participantError) throw participantError;

      const { error: completionError } = await supabase
        .from("classroom_private_completions")
        .delete()
        .eq("run_id", id);
      if (completionError && !["PGRST205", "42P01"].includes(completionError.code)) {
        throw completionError;
      }

      const { error: bingoError } = await supabase
        .from("bingo_card_counters")
        .update({ next_card: 0, updated_at: new Date().toISOString() })
        .eq("activity_key", "life-experience-bingo");
      if (bingoError && !["PGRST205", "42P01"].includes(bingoError.code)) throw bingoError;

      const { error: reopenError } = await supabase
        .from("classroom_runs")
        .update({
          state: "open",
          joins_open: true,
          expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", id);
      if (reopenError) throw reopenError;
    } else if (body.action === "set-activity-mode") {
      if (!("activityKey" in body) || !isActivityKey(body.activityKey)) throw new ApiError(400, "Activity not found.");
      if (!("mode" in body) || !["closed", "live", "review"].includes(String(body.mode))) {
        throw new ApiError(400, "Activity mode is invalid.");
      }
      if (body.mode === "live") {
        const { data: run, error: runError } = await supabase
          .from("classroom_runs")
          .select("id")
          .eq("id", id)
          .eq("state", "open")
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();
        if (runError) throw runError;
        if (!run) throw new ApiError(409, "Start a new classroom session before opening a live activity.");
      }
      const { error } = await supabase
        .from("classroom_activity_states")
        .update({
          is_open: body.mode === "live",
          is_revealed: body.mode === "review",
          updated_at: new Date().toISOString(),
        })
        .eq("run_id", id)
        .eq("activity_key", body.activityKey);
      if (error) throw error;
    } else {
      throw new ApiError(400, "Unknown classroom action.");
    }

    return NextResponse.json({ updated: true });
  } catch (error) {
    return apiFailure(error);
  }
}
