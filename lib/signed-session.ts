import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

type ParticipantSession = {
  kind: "participant";
  participantId: string;
  runId: string;
  expiresAt: number;
};

type InstructorSession = {
  kind: "instructor";
  email: string;
  expiresAt: number;
};

type BingoSession = {
  kind: "bingo";
  cardIndex: number;
  expiresAt: number;
};

export type SignedSession = ParticipantSession | InstructorSession | BingoSession;

function signingSecret() {
  const secret = process.env.SESSION_SIGNING_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET_NOT_CONFIGURED");
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

export function signSession(session: SignedSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySession(token: string | undefined): SignedSession | null {
  if (!token) return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;

  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SignedSession;
    if (!session || typeof session.expiresAt !== "number" || session.expiresAt <= Date.now()) return null;
    if (session.kind === "participant" && typeof session.participantId === "string" && typeof session.runId === "string") return session;
    if (session.kind === "instructor" && typeof session.email === "string") return session;
    if (session.kind === "bingo" && Number.isInteger(session.cardIndex) && session.cardIndex >= 0 && session.cardIndex < 100) return session;
  } catch {
    return null;
  }
  return null;
}

export const participantCookieName = "decision_lab_participant";
export const instructorCookieName = "decision_lab_instructor";
export const bingoCookieName = "decision_lab_bingo_card";

export const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
