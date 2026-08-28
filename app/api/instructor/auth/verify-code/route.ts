import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { createSupabaseAuthClient, isInstructorEmail } from "@/lib/supabase-admin";
import { instructorCookieName, secureCookieOptions, signSession } from "@/lib/signed-session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request, 1024);
    if (!body || typeof body !== "object" || !("email" in body) || !("code" in body)) {
      throw new ApiError(400, "Enter the code from your email.");
    }
    if (typeof body.email !== "string" || typeof body.code !== "string") throw new ApiError(400, "Enter the code from your email.");
    const email = body.email.trim().toLowerCase();
    const code = body.code.trim();
    if (!isInstructorEmail(email)) throw new ApiError(401, "The code could not be verified.");
    if (!/^\d{6,10}$/.test(code)) throw new ApiError(400, "Enter the numeric code from your email.");

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error || data.user?.email?.toLowerCase() !== email) throw new ApiError(401, "The code is invalid or has expired.");

    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(instructorCookieName, signSession({ kind: "instructor", email, expiresAt }), {
      ...secureCookieOptions,
      expires: new Date(expiresAt),
    });
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
