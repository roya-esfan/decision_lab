export type ReiScoringItem = {
  id: string;
  dimension: "nfc" | "fi";
  reverse: boolean;
};

export type ReiAnswers = Record<string, number>;

function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function scoreRei10(
  answers: ReiAnswers,
  items: readonly ReiScoringItem[],
) {
  if (items.some((item) => answers[item.id] === undefined)) return null;

  const dimensionScore = (dimension: "nfc" | "fi") =>
    mean(
      items
        .filter((item) => item.dimension === dimension)
        .map((item) => {
          const raw = answers[item.id];
          return item.reverse ? 6 - raw : raw;
        }),
    );

  return {
    analytical: dimensionScore("nfc"),
    intuitive: dimensionScore("fi"),
  };
}
