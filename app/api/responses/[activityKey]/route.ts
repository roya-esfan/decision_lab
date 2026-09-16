import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { isActivityKey, validateResponses } from "@/lib/classroom";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { participantCookieName, verifySession } from "@/lib/signed-session";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  context: { params: Promise<{ activityKey: string }> },
) {
  try {
    assertSameOrigin(request);
    const { activityKey } = await context.params;
    if (!isActivityKey(activityKey)) throw new ApiError(404, "Activity not found.");

    const token = (await cookies()).get(participantCookieName)?.value;
    const session = verifySession(token);
    if (!session || session.kind !== "participant") throw new ApiError(401, "Join the classroom session before responding.");

    const body = await readJson(request, activityKey === "land-dispute" ? 8192 : 2048);
    if (!body || typeof body !== "object" || !("idempotencyKey" in body) || !("responses" in body)) {
      throw new ApiError(400, "The response was not accepted.");
    }
    if (typeof body.idempotencyKey !== "string" || !uuidPattern.test(body.idempotencyKey)) {
      throw new ApiError(400, "The response was not accepted.");
    }
    if (!validateResponses(activityKey, body.responses)) throw new ApiError(400, "The response was not accepted.");

    const supabase = getSupabaseAdmin();
    const responseRows = body.responses.map((response) => ({
      prompt_key: response.promptKey,
      choice: response.choice,
    }));
    const { data, error } = activityKey === "land-dispute"
      ? await supabase.rpc("submit_land_dispute_response", {
          p_run_id: session.runId,
          p_participant_id: session.participantId,
          p_idempotency_key: body.idempotencyKey,
          p_decision: responseRows.find((item) => item.prompt_key === "land-dispute-choice")?.choice,
          p_explanation: responseRows.find((item) => item.prompt_key === "land-dispute-explanation")?.choice,
        })
      : await supabase.rpc("submit_classroom_responses", {
          p_run_id: session.runId,
          p_participant_id: session.participantId,
          p_activity_key: activityKey,
          p_idempotency_key: body.idempotencyKey,
          p_responses: responseRows,
        });
    if (error) {
      if (error.message.includes("ALREADY_SUBMITTED")) throw new ApiError(409, "You have already responded to this activity.");
      if (error.message.includes("ACTIVITY_CLOSED")) throw new ApiError(409, "This activity is currently closed.");
      if (error.message.includes("RUN_CLOSED") || error.message.includes("SESSION_EXPIRED")) throw new ApiError(401, "This classroom session has ended.");
      if (error.message.includes("INVALID_")) throw new ApiError(400, "The response was not accepted.");
      throw error;
    }

    return NextResponse.json({ accepted: data === "ACCEPTED" || data === "IDEMPOTENT_REPLAY" });
  } catch (error) {
    return apiFailure(error);
  }
}
