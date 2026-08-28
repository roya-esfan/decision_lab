import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { generateJoinCode } from "@/lib/classroom";
import { requireInstructor } from "@/lib/instructor-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireInstructor();
    const supabase = getSupabaseAdmin();
    const { data: run, error: runError } = await supabase
      .from("classroom_runs")
      .select("id, join_code, state, joins_open, capacity, created_at, expires_at")
      .eq("state", "open")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) return NextResponse.json({ run: null }, { headers: { "Cache-Control": "no-store" } });

    const [{ data: activities, error: activityError }, { count, error: countError }] = await Promise.all([
      supabase
        .from("classroom_activity_states")
        .select("activity_key, is_open, is_revealed")
        .eq("run_id", run.id)
        .order("activity_key"),
      supabase
        .from("classroom_participants")
        .select("id", { count: "exact", head: true })
        .eq("run_id", run.id)
        .gt("expires_at", new Date().toISOString()),
    ]);
    if (activityError) throw activityError;
    if (countError) throw countError;

    return NextResponse.json({
      run: {
        id: run.id,
        joinCode: run.join_code,
        state: run.state,
        joinsOpen: run.joins_open,
        capacity: run.capacity,
        createdAt: run.created_at,
        expiresAt: run.expires_at,
        participantCount: count ?? 0,
        activities: (activities ?? []).map((activity) => ({
          key: activity.activity_key,
          isOpen: activity.is_open,
          isRevealed: activity.is_revealed,
        })),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireInstructor();
    const body = await readJson(request, 512);
    const capacity = body && typeof body === "object" && "capacity" in body ? Number(body.capacity) : 120;
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) throw new ApiError(400, "Capacity must be between 1 and 500.");

    const supabase = getSupabaseAdmin();
    await supabase.rpc("cleanup_decision_lab_data");

    const { data: existingRun, error: existingRunError } = await supabase
      .from("classroom_runs")
      .select("id")
      .eq("state", "open")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (existingRunError) throw existingRunError;
    if (existingRun) throw new ApiError(409, "An open classroom session already exists.");

    let run: { id: string; join_code: string; state: string; joins_open: boolean; capacity: number; created_at: string; expires_at: string } | null = null;
    for (let attempt = 0; attempt < 5 && !run; attempt += 1) {
      const { data, error } = await supabase
        .from("classroom_runs")
        .insert({ join_code: generateJoinCode(), capacity })
        .select("id, join_code, state, joins_open, capacity, created_at, expires_at")
        .single();
      if (!error && data) run = data;
      else if (error?.code !== "23505") throw error;
    }
    if (!run) throw new Error("JOIN_CODE_GENERATION_FAILED");

    const { error: stateError } = await supabase.from("classroom_activity_states").insert([
      { run_id: run.id, activity_key: "assignment-1" },
      { run_id: run.id, activity_key: "assignment-2" },
    ]);
    if (stateError) {
      await supabase.from("classroom_runs").delete().eq("id", run.id);
      throw stateError;
    }

    return NextResponse.json({ created: true, runId: run.id }, { status: 201 });
  } catch (error) {
    return apiFailure(error);
  }
}
