export const companyRevenueGroups = {
  A: [
    "Reebok International",
    "Hilton Hotels",
    "Starbucks",
    "RadioShack",
    "Hershey Foods",
  ],
  B: [
    "ConocoPhillips",
    "American International Group",
    "McKesson",
    "AmerisourceBergen",
    "Altria Group",
  ],
} as const;

export const deathCauses = [
  { key: "death-tobacco", label: "Tobacco", deaths2000: 435_000 },
  {
    key: "death-diet-inactivity",
    label: "Poor diet and physical inactivity",
    deaths2000: 365_000,
  },
  { key: "death-motor-vehicles", label: "Motor vehicle accidents", deaths2000: 43_000 },
  { key: "death-firearms", label: "Firearms (guns)", deaths2000: 29_000 },
  { key: "death-illicit-drugs", label: "Illicit drug use", deaths2000: 17_000 },
] as const;

export type DeathCause = (typeof deathCauses)[number];

export type RankingResultRow = {
  promptKey: string;
  label: string;
  counts: Record<string, number>;
};

export function summarizeCauseRankings(results: readonly RankingResultRow[]) {
  return results
    .map((result) => {
      const total = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
      const weightedTotal = Object.entries(result.counts).reduce(
        (sum, [rank, count]) => sum + Number(rank) * count,
        0,
      );
      const cause = deathCauses.find((item) => item.key === result.promptKey);

      return {
        ...result,
        total,
        meanRank: total === 0 ? null : weightedTotal / total,
        deaths2000: cause?.deaths2000 ?? null,
      };
    })
    .sort((first, second) => {
      if (first.meanRank === null && second.meanRank === null) return 0;
      if (first.meanRank === null) return 1;
      if (second.meanRank === null) return -1;
      return first.meanRank - second.meanRank;
    });
}
