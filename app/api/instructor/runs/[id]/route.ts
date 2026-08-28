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
    if (body.action === "set-joins") {
      if (!("open" in body) || typeof body.open !== "boolean") throw new ApiError(400, "Join state is invalid.");
      const { error } = await supabase.from("classroom_runs").update({ joins_open: body.open }).eq("id", id).eq("state", "open");
      if (error) throw error;
    } else if (body.action === "close-run") {
      const { error } = await supabase.from("classroom_runs").update({ state: "closed", joins_open: false }).eq("id", id);
      if (error) throw error;
      const { error: activityError } = await supabase.from("classroom_activity_states").update({ is_open: false }).eq("run_id", id);
      if (activityError) throw activityError;
    } else if (body.action === "set-activity") {
      if (!("activityKey" in body) || !isActivityKey(body.activityKey)) throw new ApiError(400, "Activity not found.");
      const updates: { updated_at: string; is_open?: boolean; is_revealed?: boolean } = { updated_at: new Date().toISOString() };
      if ("open" in body) {
        if (typeof body.open !== "boolean") throw new ApiError(400, "Activity state is invalid.");
        updates.is_open = body.open;
      }
      if ("revealed" in body) {
        if (typeof body.revealed !== "boolean") throw new ApiError(400, "Reveal state is invalid.");
        updates.is_revealed = body.revealed;
      }
      if (updates.is_open === undefined && updates.is_revealed === undefined) throw new ApiError(400, "Activity state is invalid.");
      const { error } = await supabase.from("classroom_activity_states").update(updates).eq("run_id", id).eq("activity_key", body.activityKey);
      if (error) throw error;
    } else {
      throw new ApiError(400, "Unknown classroom action.");
    }

    return NextResponse.json({ updated: true });
  } catch (error) {
    return apiFailure(error);
  }
}
