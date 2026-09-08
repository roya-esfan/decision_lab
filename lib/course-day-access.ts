import "server-only";

import { getSupabaseAdmin } from "./supabase-admin";

export const courseDayNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type CourseDayNumber = (typeof courseDayNumbers)[number];

export type CourseDayAccessState = {
  publishedDays: CourseDayNumber[];
  ready: boolean;
};

const safeDefault: CourseDayAccessState = {
  publishedDays: [1],
  ready: false,
};

export function isCourseDayNumber(value: number): value is CourseDayNumber {
  return courseDayNumbers.includes(value as CourseDayNumber);
}

export async function getCourseDayAccess(): Promise<CourseDayAccessState> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("course_day_access")
      .select("day_number, is_published")
      .order("day_number");

    if (error) return safeDefault;

    const publishedDays = (data ?? [])
      .filter((row) => row.is_published && isCourseDayNumber(row.day_number))
      .map((row) => row.day_number as CourseDayNumber);

    return { publishedDays, ready: true };
  } catch {
    return safeDefault;
  }
}

export async function isCourseDayPublished(dayNumber: number) {
  if (!isCourseDayNumber(dayNumber)) return false;
  const state = await getCourseDayAccess();
  return state.publishedDays.includes(dayNumber);
}
