export const probabilityNewsScale = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "not-sure",
] as const;

export const probabilityNewsCases = [
  { key: "probability-news-a", letter: "A", change: "From 0% to 5%" },
  { key: "probability-news-b", letter: "B", change: "From 5% to 10%" },
  { key: "probability-news-c", letter: "C", change: "From 60% to 65%" },
  { key: "probability-news-d", letter: "D", change: "From 95% to 100%" },
] as const;

export type ProbabilityNewsSummary = {
  promptKey: string;
  letter: string;
  change: string;
  mean: number | null;
  ratings: number;
  notSure: number;
};

export function summarizeProbabilityNews(
  results: Array<{ promptKey: string; counts: Record<string, number> }>,
): ProbabilityNewsSummary[] {
  return probabilityNewsCases.map((item) => {
    const counts = results.find((result) => result.promptKey === item.key)?.counts ?? {};
    let weightedTotal = 0;
    let ratings = 0;

    for (let rating = 0; rating <= 10; rating += 1) {
      const count = counts[String(rating)] ?? 0;
      weightedTotal += rating * count;
      ratings += count;
    }

    return {
      promptKey: item.key,
      letter: item.letter,
      change: item.change,
      mean: ratings === 0 ? null : weightedTotal / ratings,
      ratings,
      notSure: counts["not-sure"] ?? 0,
    };
  });
}
