export type WageFairnessGroup = "A" | "B";
export type WageFairnessDecision = "fair" | "unfair";

export const wageFairnessResponseChoices = [
  "A:fair",
  "A:unfair",
  "B:fair",
  "B:unfair",
] as const;

export function encodeWageFairnessResponse(
  group: WageFairnessGroup,
  decision: WageFairnessDecision,
) {
  return `${group}:${decision}`;
}

export function summarizeWageFairnessCounts(counts: Record<string, number>) {
  return (["A", "B"] as const).map((group) => {
    const fair = counts[`${group}:fair`] ?? 0;
    const unfair = counts[`${group}:unfair`] ?? 0;
    const total = fair + unfair;
    return {
      group,
      label: group === "A" ? "7% wage decrease" : "5% wage increase with 12% inflation",
      fair,
      unfair,
      total,
      fairPercentage: total === 0 ? 0 : Math.round((fair / total) * 100),
      unfairPercentage: total === 0 ? 0 : Math.round((unfair / total) * 100),
    };
  });
}
