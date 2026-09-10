export type CrewProblemFrame = "gain" | "loss";
export type CrewProblemConditionNumber = "1" | "2";
export type CrewProblemDecision = "certain" | "uncertain";

export const crewProblemConditions: Record<CrewProblemConditionNumber, CrewProblemFrame> = {
  "1": "gain",
  "2": "loss",
};

export const crewProblemResponseChoices = [
  "gain:certain",
  "gain:uncertain",
  "loss:certain",
  "loss:uncertain",
] as const;

export function encodeCrewProblemResponse(
  frame: CrewProblemFrame,
  decision: CrewProblemDecision,
) {
  return `${frame}:${decision}`;
}

export function summarizeCrewProblemCounts(counts: Record<string, number>) {
  return (["gain", "loss"] as const).map((frame) => {
    const certain = counts[`${frame}:certain`] ?? 0;
    const uncertain = counts[`${frame}:uncertain`] ?? 0;
    const total = certain + uncertain;
    return {
      frame,
      conditionNumber: frame === "gain" ? "1" : "2",
      label: frame === "gain" ? "Gain frame" : "Loss frame",
      certain,
      uncertain,
      total,
      certainPercentage: total === 0 ? 0 : Math.round((certain / total) * 100),
      uncertainPercentage: total === 0 ? 0 : Math.round((uncertain / total) * 100),
    };
  });
}
