export const outcomeBiasRatings = [3, 2, 1, 0, -1, -2, -3] as const;

export const outcomeBiasRatingLabels: Record<(typeof outcomeBiasRatings)[number], string> = {
  3: "Clearly correct, and the opposite decision would be inexcusable",
  2: "Correct, all things considered",
  1: "Correct, but the opposite would be reasonable too",
  0: "The decision and its opposite are equally good",
  [-1]: "Incorrect, but not unreasonable",
  [-2]: "Incorrect, all things considered",
  [-3]: "Incorrect and inexcusable",
};

export type OutcomeBiasCondition = "failure" | "success";
export type OutcomeBiasConditionNumber = "1" | "2";

export const outcomeBiasConditions: Record<OutcomeBiasConditionNumber, OutcomeBiasCondition> = {
  "1": "failure",
  "2": "success",
};

export const outcomeBiasResponseChoices = (["failure", "success"] as const).flatMap((condition) =>
  outcomeBiasRatings.map((rating) => `${condition}:${rating}`),
);

export function encodeOutcomeBiasResponse(condition: OutcomeBiasCondition, rating: number) {
  return `${condition}:${rating}`;
}

export function summarizeOutcomeBiasCounts(counts: Record<string, number>) {
  return (["failure", "success"] as const).map((condition) => {
    let count = 0;
    let total = 0;
    for (const rating of outcomeBiasRatings) {
      const responses = counts[`${condition}:${rating}`] ?? 0;
      count += responses;
      total += responses * rating;
    }
    return {
      condition,
      conditionNumber: condition === "failure" ? "1" : "2",
      label: condition === "failure" ? "Failure" : "Success",
      count,
      mean: count === 0 ? null : total / count,
    };
  });
}
