export type LandDisputeGroup = "plaintiff" | "defendant";
export type LandDisputeDecision = "yes" | "no";

export const landDisputeResponseChoices = [
  "plaintiff:yes",
  "plaintiff:no",
  "defendant:yes",
  "defendant:no",
] as const;

export function encodeLandDisputeDecision(group: LandDisputeGroup, decision: LandDisputeDecision) {
  return `${group}:${decision}`;
}

export function summarizeLandDisputeCounts(counts: Record<string, number>) {
  return (["plaintiff", "defendant"] as const).map((group) => {
    const yes = counts[`${group}:yes`] ?? 0;
    const no = counts[`${group}:no`] ?? 0;
    const total = yes + no;
    return {
      group,
      groupLetter: group === "plaintiff" ? "A" : "B",
      label: group === "plaintiff" ? "Plaintiff" : "Defendant",
      yes,
      no,
      total,
      yesPercentage: total === 0 ? 0 : Math.round((yes / total) * 100),
      noPercentage: total === 0 ? 0 : Math.round((no / total) * 100),
    };
  });
}
