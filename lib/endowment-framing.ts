export const endowmentFramingConditions = {
  "1": "gain",
  "2": "loss",
} as const;

export type EndowmentFramingConditionNumber = keyof typeof endowmentFramingConditions;
export type EndowmentFramingCondition = (typeof endowmentFramingConditions)[EndowmentFramingConditionNumber];
export type EndowmentFramingDecision = "certain" | "gamble";

export const endowmentFramingResponseChoices = [
  "gain:certain",
  "gain:gamble",
  "loss:certain",
  "loss:gamble",
] as const;

export function encodeEndowmentFramingResponse(
  condition: EndowmentFramingCondition,
  decision: EndowmentFramingDecision,
) {
  return `${condition}:${decision}` as (typeof endowmentFramingResponseChoices)[number];
}

export function summarizeEndowmentFramingCounts(counts: Record<string, number>) {
  return ([
    { conditionNumber: "1", condition: "gain", label: "$1,000 starting amount" },
    { conditionNumber: "2", condition: "loss", label: "$2,000 starting amount" },
  ] as const).map((item) => {
    const certain = counts[`${item.condition}:certain`] ?? 0;
    const gamble = counts[`${item.condition}:gamble`] ?? 0;
    const total = certain + gamble;
    return {
      ...item,
      certain,
      gamble,
      total,
      certainPercentage: total === 0 ? 0 : Math.round((certain / total) * 100),
      gamblePercentage: total === 0 ? 0 : Math.round((gamble / total) * 100),
    };
  });
}
