import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiFailure } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { participantCookieName, verifySession } from "@/lib/signed-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = (await cookies()).get(participantCookieName)?.value;
    const session = verifySession(token);
    if (!session || session.kind !== "participant") return NextResponse.json({ joined: false });

    const supabase = getSupabaseAdmin();
    const { data: participant, error: participantError } = await supabase
      .from("classroom_participants")
      .select("id, expires_at")
      .eq("id", session.participantId)
      .eq("run_id", session.runId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (participantError) throw participantError;
    if (!participant) return NextResponse.json({ joined: false });

    const { data: run, error: runError } = await supabase
      .from("classroom_runs")
      .select("id, state, expires_at")
      .eq("id", session.runId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (runError) throw runError;

    return NextResponse.json({ joined: Boolean(run && run.state === "open"), runId: run?.id ?? null }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiFailure(error);
  }
}
