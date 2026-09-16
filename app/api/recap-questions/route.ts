import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import {
  recapQuestionDeadlineHasPassed,
  recapQuestionMaxLength,
} from "@/lib/recap-questions";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (recapQuestionDeadlineHasPassed()) {
      throw new ApiError(410, "The deadline for submitting questions has passed.");
    }

    const body = await readJson(request, 2048);
    if (!body || typeof body !== "object") throw new ApiError(400, "The question could not be submitted.");

    const idempotencyKey = "idempotencyKey" in body ? body.idempotencyKey : undefined;
    const rawQuestion = "question" in body ? body.question : undefined;
    if (typeof idempotencyKey !== "string" || !uuidPattern.test(idempotencyKey)) {
      throw new ApiError(400, "The question could not be submitted.");
    }
    if (typeof rawQuestion !== "string") throw new ApiError(400, "Please enter a question.");

    const question = rawQuestion.trim();
    if (!question) throw new ApiError(400, "Please enter a question.");
    if (question.length > recapQuestionMaxLength) {
      throw new ApiError(400, `Questions can be up to ${recapQuestionMaxLength} characters.`);
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: existingError } = await supabase
      .from("recap_questions")
      .select("created_at")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingError && ["PGRST205", "42P01"].includes(existingError.code)) {
      throw new ApiError(409, "Question collection has not been activated yet.");
    }
    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json(
        { saved: true, savedAt: existing.created_at },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("recap_questions")
      .insert({ idempotency_key: idempotencyKey, question })
      .select("created_at")
      .single();

    if (insertError?.code === "23505") {
      const { data: concurrent, error: concurrentError } = await supabase
        .from("recap_questions")
        .select("created_at")
        .eq("idempotency_key", idempotencyKey)
        .single();
      if (concurrentError) throw concurrentError;
      return NextResponse.json(
        { saved: true, savedAt: concurrent.created_at },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (insertError && ["PGRST205", "42P01"].includes(insertError.code)) {
      throw new ApiError(409, "Question collection has not been activated yet.");
    }
    if (insertError) throw insertError;

    return NextResponse.json(
      { saved: true, savedAt: inserted.created_at },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
