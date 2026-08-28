export const activityKeys = ["assignment-1", "assignment-2"] as const;
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

  return definitions.every((definition) => {
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
}

export function generateJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
