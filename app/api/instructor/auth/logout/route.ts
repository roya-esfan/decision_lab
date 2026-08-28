import { NextResponse } from "next/server";
import { apiFailure, assertSameOrigin } from "@/lib/api";
import { instructorCookieName, secureCookieOptions } from "@/lib/signed-session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set(instructorCookieName, "", { ...secureCookieOptions, maxAge: 0 });
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
