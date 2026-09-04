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
        if (!run) throw new ApiError(409, "Start a new Day 1 session before opening a live activity.");
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
