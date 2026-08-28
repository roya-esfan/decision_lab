import "server-only";

import { createClient } from "@supabase/supabase-js";

function configuration() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("SUPABASE_NOT_CONFIGURED");
  return { url, secretKey };
}

export function getSupabaseAdmin() {
  const { url, secretKey } = configuration();
  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseAuthClient() {
  return getSupabaseAdmin();
}

export function isInstructorEmail(email: string) {
  const allowed = (process.env.INSTRUCTOR_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
