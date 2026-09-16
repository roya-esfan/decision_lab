import { NextResponse } from "next/server";
import { ApiError, apiFailure } from "@/lib/api";
import { requireInstructor } from "@/lib/instructor-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireInstructor();
    const { data, error } = await getSupabaseAdmin()
      .from("recap_questions")
      .select("id, question, created_at")
      .order("created_at", { ascending: false });

    if (error && ["PGRST205", "42P01"].includes(error.code)) {
      throw new ApiError(409, "Run the recap-question Supabase migration to activate this section.");
    }
    if (error) throw error;

    return NextResponse.json(
      {
        questions: (data ?? []).map((item) => ({
          id: item.id,
          question: item.question,
          createdAt: item.created_at,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
