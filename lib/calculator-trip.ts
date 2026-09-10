export const calculatorTripConditions = {
  "1": "low-price",
  "2": "high-price",
} as const;

export type CalculatorTripConditionNumber = keyof typeof calculatorTripConditions;
export type CalculatorTripCondition = (typeof calculatorTripConditions)[CalculatorTripConditionNumber];
export type CalculatorTripDecision = "yes" | "no";

export const calculatorTripResponseChoices = [
  "low-price:yes",
  "low-price:no",
  "high-price:yes",
  "high-price:no",
] as const;

export function encodeCalculatorTripResponse(
  condition: CalculatorTripCondition,
  decision: CalculatorTripDecision,
) {
  return `${condition}:${decision}` as (typeof calculatorTripResponseChoices)[number];
}

export function summarizeCalculatorTripCounts(counts: Record<string, number>) {
  return ([
    { conditionNumber: "1", condition: "low-price", label: "$15 calculator" },
    { conditionNumber: "2", condition: "high-price", label: "$125 calculator" },
  ] as const).map((item) => {
    const yes = counts[`${item.condition}:yes`] ?? 0;
    const no = counts[`${item.condition}:no`] ?? 0;
    const total = yes + no;
    return {
      ...item,
      yes,
      no,
      total,
      yesPercentage: total === 0 ? 0 : Math.round((yes / total) * 100),
      noPercentage: total === 0 ? 0 : Math.round((no / total) * 100),
    };
  });
}
