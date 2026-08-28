import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { createSupabaseAuthClient, isInstructorEmail } from "@/lib/supabase-admin";
import { instructorCookieName, secureCookieOptions, signSession } from "@/lib/signed-session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request, 6144);
    if (!body || typeof body !== "object" || !("accessToken" in body) || typeof body.accessToken !== "string") {
      throw new ApiError(400, "The sign-in link could not be verified.");
    }
    if (body.accessToken.length < 100 || body.accessToken.length > 5000) throw new ApiError(400, "The sign-in link could not be verified.");

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.getUser(body.accessToken);
    const email = data.user?.email?.trim().toLowerCase();
    if (error || !email || !isInstructorEmail(email)) throw new ApiError(401, "The sign-in link is invalid or has expired.");

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
