import "server-only";

import { cookies } from "next/headers";
import { ApiError } from "./api";
import { isInstructorEmail } from "./supabase-admin";
import { instructorCookieName, verifySession } from "./signed-session";

export async function requireInstructor() {
  const token = (await cookies()).get(instructorCookieName)?.value;
  const session = verifySession(token);
  if (!session || session.kind !== "instructor" || !isInstructorEmail(session.email)) {
    throw new ApiError(401, "Instructor sign-in is required.");
  }
  return session;
}

export async function getInstructor() {
  try {
    return await requireInstructor();
  } catch {
    return null;
  }
}
