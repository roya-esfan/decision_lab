import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { getCourseDayAccess, isCourseDayNumber } from "@/lib/course-day-access";
import { requireInstructor } from "@/lib/instructor-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireInstructor();
    const state = await getCourseDayAccess();
    return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    await requireInstructor();
    const body = await readJson(request, 256);
    if (!body || typeof body !== "object") throw new ApiError(400, "Day visibility could not be updated.");

    const dayNumber = "dayNumber" in body ? Number(body.dayNumber) : Number.NaN;
    const published = "published" in body ? body.published : undefined;
    if (!isCourseDayNumber(dayNumber) || typeof published !== "boolean") {
      throw new ApiError(400, "Day visibility could not be updated.");
    }

    const { error } = await getSupabaseAdmin()
      .from("course_day_access")
      .upsert({
        day_number: dayNumber,
        is_published: published,
        updated_at: new Date().toISOString(),
      }, { onConflict: "day_number" });

    if (error && ["PGRST205", "42P01"].includes(error.code)) {
      throw new ApiError(409, "Run the latest Supabase migration before changing day visibility.");
    }
    if (error) throw error;

    return NextResponse.json({ updated: true, dayNumber, published });
  } catch (error) {
    return apiFailure(error);
  }
}
