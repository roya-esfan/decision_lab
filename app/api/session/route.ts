import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isControlledActivityKey,
  isResponseActivityKey,
} from "@/lib/activity-catalog";
import { ApiError, apiFailure } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { participantCookieName, verifySession } from "@/lib/signed-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const activityKey = new URL(request.url).searchParams.get("activity");
    if (!isControlledActivityKey(activityKey)) throw new ApiError(400, "Activity not found.");

    const supabase = getSupabaseAdmin();
    const { data: activeRun, error: runError } = await supabase
      .from("classroom_runs")
      .select("id, expires_at")
      .eq("state", "open")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;

    if (activeRun) {
      const { data: activity, error: activityError } = await supabase
        .from("classroom_activity_states")
        .select("is_open")
        .eq("run_id", activeRun.id)
        .eq("activity_key", activityKey)
        .maybeSingle();
      if (activityError) throw activityError;

      if (activity?.is_open && !isResponseActivityKey(activityKey)) {
        return NextResponse.json(
          { mode: "live", joined: true, runId: activeRun.id },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      if (activity?.is_open) {
        const token = (await cookies()).get(participantCookieName)?.value;
        const session = verifySession(token);
        if (!session || session.kind !== "participant" || session.runId !== activeRun.id) {
          return NextResponse.json(
            { mode: "join", joined: false, runId: activeRun.id },
            { headers: { "Cache-Control": "no-store" } },
          );
        }

        const { data: participant, error: participantError } = await supabase
          .from("classroom_participants")
          .select("id, expires_at")
          .eq("id", session.participantId)
          .eq("run_id", session.runId)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();
        if (participantError) throw participantError;
        if (!participant) {
          return NextResponse.json(
            { mode: "join", joined: false, runId: activeRun.id },
            { headers: { "Cache-Control": "no-store" } },
          );
        }

        return NextResponse.json({ mode: "live", joined: true, runId: activeRun.id }, {
          headers: { "Cache-Control": "no-store" },
        });
      }
    }

    const { data: reviewActivity, error: reviewError } = await supabase
      .from("classroom_activity_states")
      .select("run_id")
      .eq("activity_key", activityKey)
      .eq("is_open", false)
      .eq("is_revealed", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (reviewError) throw reviewError;
    if (reviewActivity) {
      return NextResponse.json(
        { mode: "review", joined: false, runId: reviewActivity.run_id },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { mode: "closed", joined: false, runId: activeRun?.id ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
