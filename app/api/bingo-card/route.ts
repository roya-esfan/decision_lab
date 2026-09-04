import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFailure, assertSameOrigin, readJson } from "@/lib/api";
import { bingoCardCatalog } from "@/lib/bingo-card-catalog";
import {
  bingoCookieName,
  secureCookieOptions,
  signSession,
  verifySession,
} from "@/lib/signed-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const payload = await readJson(request, 2);
    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      Object.keys(payload).length > 0
    ) {
      throw new ApiError(400, "Request body must be an empty object.");
    }

    const existingToken = (await cookies()).get(bingoCookieName)?.value;
    const existingSession = verifySession(existingToken);
    if (
      existingSession?.kind === "bingo" &&
      existingSession.cardIndex < bingoCardCatalog.length
    ) {
      return NextResponse.json(
        {
          cardIndex: existingSession.cardIndex,
          cardIds: bingoCardCatalog[existingSession.cardIndex],
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("claim_bingo_card", {
      p_activity_key: "life-experience-bingo",
      p_catalog_size: bingoCardCatalog.length,
    });
    if (error) throw error;

    const cardIndex = Number(data);
    if (!Number.isInteger(cardIndex) || cardIndex < 0 || cardIndex >= bingoCardCatalog.length) {
      throw new Error("BINGO_CARD_INDEX_INVALID");
    }

    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const response = NextResponse.json(
      { cardIndex, cardIds: bingoCardCatalog[cardIndex] },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(
      bingoCookieName,
      signSession({ kind: "bingo", cardIndex, expiresAt }),
      { ...secureCookieOptions, expires: new Date(expiresAt) },
    );
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
