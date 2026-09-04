import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFailure } from "@/lib/api";
import { isActivityKey } from "@/lib/classroom";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { participantCookieName, verifySession } from "@/lib/signed-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const activityKey = new URL(request.url).searchParams.get("activity");
    if (!isActivityKey(activityKey)) throw new ApiError(400, "Activity not found.");

    const supabase = getSupabaseAdmin();
    const { data: run, error: runError } = await supabase
      .from("classroom_runs")
      .select("id, state, expires_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) {
      return NextResponse.json(
        { mode: "closed", joined: false, runId: null },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: activity, error: activityError } = await supabase
      .from("classroom_activity_states")
      .select("is_open, is_revealed")
      .eq("run_id", run.id)
      .eq("activity_key", activityKey)
      .maybeSingle();
    if (activityError) throw activityError;

    const runIsActive = run.state === "open" && new Date(run.expires_at).getTime() > Date.now();
    if (!runIsActive || !activity?.is_open) {
      return NextResponse.json(
        {
          mode: activity?.is_revealed ? "review" : "closed",
          joined: false,
          runId: run.id,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const token = (await cookies()).get(participantCookieName)?.value;
    const session = verifySession(token);
    if (!session || session.kind !== "participant" || session.runId !== run.id) {
      return NextResponse.json(
        { mode: "join", joined: false, runId: run.id },
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
        { mode: "join", joined: false, runId: run.id },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json({ mode: "live", joined: true, runId: run.id }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiFailure(error);
  }
}
