import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { createSupabaseAuthClient, isInstructorEmail } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request, 1024);
    if (!body || typeof body !== "object" || !("email" in body) || typeof body.email !== "string") {
      throw new ApiError(400, "Enter your instructor email address.");
    }
    const email = body.email.trim().toLowerCase();
    if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, "Enter a valid email address.");

    if (isInstructorEmail(email)) {
      const supabase = createSupabaseAuthClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    return apiFailure(error);
  }
}
