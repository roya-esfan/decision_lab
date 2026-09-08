import { outcomeBiasResponseChoices } from "./outcome-bias";
import { deathCauses } from "./day-two-activities";

export const activityKeys = [
  "assignment-1",
  "outcome-bias",
  "assignment-2",
  "company-revenue",
  "causes-of-death",
] as const;
export type ActivityKey = (typeof activityKeys)[number];

export const promptDefinitions = {
  "assignment-1": [
    { key: "bargain-50", label: "50 kr to you / 50 kr to Eve", choices: ["accept", "reject"] },
    { key: "bargain-20", label: "20 kr to you / 80 kr to Eve", choices: ["accept", "reject"] },
    { key: "bargain-2", label: "2 kr to you / 98 kr to Eve", choices: ["accept", "reject"] },
  ],
  "assignment-2": [
    { key: "exam-result", label: "Exam result", choices: ["70/100", "96/137"] },
  ],
  "outcome-bias": [
    { key: "outcome-bypass", label: "Scenario 1 · Bypass operation", choices: outcomeBiasResponseChoices },
    { key: "outcome-diagnostic-test", label: "Scenario 2 · Diagnostic test", choices: outcomeBiasResponseChoices },
    { key: "outcome-gamble", label: "Scenario 3 · Prize choice", choices: outcomeBiasResponseChoices },
  ],
  "company-revenue": [
    { key: "company-revenue-group", label: "Group with larger total sales revenue", choices: ["Group A", "Group B"] },
  ],
  "causes-of-death": deathCauses.map((cause) => ({
    key: cause.key,
    label: cause.label,
    choices: ["1", "2", "3", "4", "5"] as const,
  })),
} as const;

export function isActivityKey(value: unknown): value is ActivityKey {
  return typeof value === "string" && activityKeys.includes(value as ActivityKey);
}

export function validateResponses(
  activityKey: ActivityKey,
  responses: unknown,
): responses is Array<{ promptKey: string; choice: string }> {
  if (!Array.isArray(responses)) return false;
  const definitions = promptDefinitions[activityKey];
  if (responses.length !== definitions.length) return false;

  const valid = definitions.every((definition) => {
    const response = responses.find((item) =>
      typeof item === "object" && item !== null && "promptKey" in item && item.promptKey === definition.key,
    );
    return Boolean(
      response
      && "choice" in response
      && typeof response.choice === "string"
      && (definition.choices as readonly string[]).includes(response.choice),
    );
  });

  if (!valid) return false;
  if (activityKey !== "causes-of-death") return true;

  return new Set(
    responses.map((response) =>
      typeof response === "object" && response !== null && "choice" in response
        ? response.choice
        : null,
    ),
  ).size === definitions.length;
}

export function generateJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
