import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { participantCookieName, secureCookieOptions, signSession } from "@/lib/signed-session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request, 512);
    if (!body || typeof body !== "object" || !("code" in body) || typeof body.code !== "string") {
      throw new ApiError(400, "Enter the eight-character class code.");
    }
    const code = body.code.trim().toUpperCase();
    if (!/^[A-Z2-9]{8}$/.test(code)) throw new ApiError(400, "Enter the eight-character class code.");

    const participantId = crypto.randomUUID();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("join_classroom_run", {
      p_code: code,
      p_participant_id: participantId,
    });
    if (error) {
      if (error.message.includes("RUN_FULL")) throw new ApiError(409, "This classroom session is full.");
      if (error.message.includes("RUN_UNAVAILABLE")) throw new ApiError(404, "That code is not open for joining.");
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
