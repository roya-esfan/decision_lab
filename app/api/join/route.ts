import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { isActivityKey } from "@/lib/classroom";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { participantCookieName, secureCookieOptions, signSession } from "@/lib/signed-session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request, 512);
    if (!body || typeof body !== "object" || !("activityKey" in body) || !isActivityKey(body.activityKey)) {
      throw new ApiError(400, "Activity not found.");
    }

    const supabase = getSupabaseAdmin();
    const { data: run, error: runError } = await supabase
      .from("classroom_runs")
      .select("id, join_code")
      .eq("state", "open")
      .eq("joins_open", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) throw new ApiError(404, "This activity is not open right now.");

    const { data: activity, error: activityError } = await supabase
      .from("classroom_activity_states")
      .select("is_open")
      .eq("run_id", run.id)
      .eq("activity_key", body.activityKey)
      .maybeSingle();
    if (activityError) throw activityError;
    if (!activity?.is_open) throw new ApiError(404, "This activity is not open right now.");

    const participantId = crypto.randomUUID();
    const { data, error } = await supabase.rpc("join_classroom_run", {
      p_code: run.join_code,
      p_participant_id: participantId,
    });
    if (error) {
      if (error.message.includes("RUN_FULL")) throw new ApiError(409, "This classroom session is full.");
      if (error.message.includes("RUN_UNAVAILABLE")) throw new ApiError(404, "This activity is not open right now.");
      throw error;
    }

    const joined = Array.isArray(data) ? data[0] : data;
    if (!joined?.run_id || !joined?.run_expires_at) throw new Error("JOIN_RESULT_INVALID");
    const expiresAt = new Date(joined.run_expires_at).getTime();
    const response = NextResponse.json({ joined: true, runId: joined.run_id });
    response.cookies.set(participantCookieName, signSession({
      kind: "participant",
      participantId,
      runId: joined.run_id,
      expiresAt,
    }), { ...secureCookieOptions, expires: new Date(expiresAt) });
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
