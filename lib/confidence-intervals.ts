export const confidenceIntervalQuestions = [
  { number: 1, promptKey: "confidence-interval-1", trueValue: 1901 },
  { number: 2, promptKey: "confidence-interval-2", trueValue: 384_400 },
  { number: 3, promptKey: "confidence-interval-3", trueValue: 56 },
  { number: 4, promptKey: "confidence-interval-4", trueValue: 22_348 },
  { number: 5, promptKey: "confidence-interval-5", trueValue: 536 },
  { number: 6, promptKey: "confidence-interval-6", trueValue: 27_900_000_000 },
  { number: 7, promptKey: "confidence-interval-7", trueValue: 12_345 },
  { number: 8, promptKey: "confidence-interval-8", trueValue: 52 },
  { number: 9, promptKey: "confidence-interval-9", trueValue: 8_300_000_000 },
  { number: 10, promptKey: "confidence-interval-10", trueValue: 7_170 },
] as const;

export const confidenceIntervalMax = 1_000_000_000_000;

export type ConfidenceInterval = {
  minimum: number;
  maximum: number;
};

export function encodeConfidenceInterval(interval: ConfidenceInterval) {
  return `${interval.minimum}|${interval.maximum}`;
}

export function parseConfidenceIntervalChoice(choice: string): ConfidenceInterval | null {
  const parts = choice.split("|");
  if (parts.length !== 2 || parts.some((part) => part.trim() === "")) return null;
  const minimum = Number(parts[0]);
  const maximum = Number(parts[1]);
  if (
    !Number.isFinite(minimum)
    || !Number.isFinite(maximum)
    || minimum < 0
    || maximum < minimum
    || maximum > confidenceIntervalMax
  ) return null;
  return { minimum, maximum };
}

export type ConfidenceIntervalResultRow = {
  promptKey: string;
  counts: Record<string, number>;
};

export function summarizeConfidenceIntervalResults(results: ConfidenceIntervalResultRow[]) {
  return confidenceIntervalQuestions.map((question) => {
    const counts = results.find((result) => result.promptKey === question.promptKey)?.counts ?? {};
    let total = 0;
    let minimumSum = 0;
    let maximumSum = 0;
    let midpointSum = 0;
    let midpointSquareSum = 0;

    for (const [choice, count] of Object.entries(counts)) {
      const interval = parseConfidenceIntervalChoice(choice);
      if (!interval || !Number.isInteger(count) || count < 1) continue;
      const midpoint = (interval.minimum + interval.maximum) / 2;
      total += count;
      minimumSum += interval.minimum * count;
      maximumSum += interval.maximum * count;
      midpointSum += midpoint * count;
      midpointSquareSum += midpoint * midpoint * count;
    }

    if (total === 0) {
      return {
        ...question,
        total,
        meanMinimum: null,
        meanMaximum: null,
        meanMidpoint: null,
        midpointStandardDeviation: null,
        trueValueWithinMeanInterval: false,
      };
    }

    const meanMinimum = minimumSum / total;
    const meanMaximum = maximumSum / total;
    const meanMidpoint = midpointSum / total;
    const variance = Math.max(0, midpointSquareSum / total - meanMidpoint * meanMidpoint);

    return {
      ...question,
      total,
      meanMinimum,
      meanMaximum,
      meanMidpoint,
      midpointStandardDeviation: Math.sqrt(variance),
      trueValueWithinMeanInterval:
        question.trueValue >= meanMinimum && question.trueValue <= meanMaximum,
    };
  });
}
