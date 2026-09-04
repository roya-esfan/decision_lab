import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { isPrivateActivityKey } from "@/lib/private-activities";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  completionCookieName,
  secureCookieOptions,
  signSession,
  verifySession,
} from "@/lib/signed-session";

export async function POST(
  request: Request,
  context: { params: Promise<{ activityKey: string }> },
) {
  try {
    assertSameOrigin(request);
    await readJson(request, 128);
    const { activityKey } = await context.params;
    if (!isPrivateActivityKey(activityKey)) throw new ApiError(404, "Activity not found.");

    const supabase = getSupabaseAdmin();
    const { data: run, error: runError } = await supabase
      .from("classroom_runs")
      .select("id, expires_at")
      .eq("state", "open")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) return NextResponse.json({ recorded: false });

    const cookieStore = await cookies();
    const existing = verifySession(cookieStore.get(completionCookieName)?.value);
    const existingMatchesRun = existing?.kind === "completion" && existing.runId === run.id;
    const anonymousId = existingMatchesRun ? existing.anonymousId : crypto.randomUUID();
    const expiresAt = new Date(run.expires_at).getTime();

    const { error } = await supabase
      .from("classroom_private_completions")
      .upsert(
        { run_id: run.id, anonymous_id: anonymousId, activity_key: activityKey },
        { onConflict: "run_id,anonymous_id,activity_key", ignoreDuplicates: true },
      );
    if (error) throw error;

    const response = NextResponse.json({ recorded: true });
    if (!existingMatchesRun) {
      response.cookies.set(completionCookieName, signSession({
        kind: "completion",
        anonymousId,
        runId: run.id,
        expiresAt,
      }), { ...secureCookieOptions, expires: new Date(expiresAt) });
    }
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
