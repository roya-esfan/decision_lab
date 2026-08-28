import "server-only";

import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new ApiError(403, "Request origin was rejected.");
}

export async function readJson(request: Request, maxBytes = 4096): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim();
  if (contentType !== "application/json") throw new ApiError(415, "Content type must be application/json.");

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new ApiError(413, "Request is too large.");

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new ApiError(413, "Request is too large.");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, "Request body is not valid JSON.");
  }
}

export function apiFailure(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Decision Lab API error", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "The service is temporarily unavailable." }, { status: 503 });
}
