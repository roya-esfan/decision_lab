import "server-only";

import { bingoExperiences } from "@/content/life-experience-bingo";

const sunkCostIds = [2, 3, 7] as const;
const selfJustificationIds = [14, 16] as const;
const endowmentIds = [8, 18] as const;
const cardsInCatalog = 100;
const permutationsPerSelection = 60;

type Candidate = {
  ids: number[];
  idSet: Set<number>;
  selectionKey: string;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items: readonly number[], seed: number) {
  const shuffled = [...items];
  const random = seededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function selectionVariants() {
  const allIds = bingoExperiences.map((item) => item.id);
  const variants: { ids: number[]; key: string }[] = [];

  for (const sunkCostId of sunkCostIds) {
    for (const selfJustificationId of selfJustificationIds) {
      for (const endowmentId of endowmentIds) {
        const excluded = new Set<number>([
          sunkCostId,
          selfJustificationId,
          endowmentId,
        ]);
        variants.push({
          ids: allIds.filter((id) => !excluded.has(id)),
          key: `${sunkCostId}-${selfJustificationId}-${endowmentId}`,
        });
      }
    }
  }

  return variants;
}

function candidateDistance(left: Candidate, right: Candidate) {
  let sharedItems = 0;
  let sharedPositions = 0;

  for (let index = 0; index < left.ids.length; index += 1) {
    if (right.idSet.has(left.ids[index])) sharedItems += 1;
    if (left.ids[index] === right.ids[index]) sharedPositions += 1;
  }

  const contentDifference = 16 - sharedItems;
  const positionDifference = 16 - sharedPositions;
  return contentDifference * 100 + positionDifference;
}

function buildCandidates() {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  selectionVariants().forEach((variant, variantIndex) => {
    for (let permutation = 0; permutation < permutationsPerSelection; permutation += 1) {
      const ids = seededShuffle(
        variant.ids,
        4129 + variantIndex * 997 + permutation * 7919,
      );
      const identity = ids.join(",");
      if (seen.has(identity)) continue;
      seen.add(identity);
      candidates.push({ ids, idSet: new Set(ids), selectionKey: variant.key });
    }
  });

  return candidates;
}

function buildCatalog() {
  const candidates = buildCandidates();
  const selected: Candidate[] = [candidates.shift()!];
  const selectionUse = new Map<string, number>([[selected[0].selectionKey, 1]]);

  while (selected.length < cardsInCatalog) {
    let bestIndex = 0;
    let bestMinimumDistance = -1;
    let bestAverageDistance = -1;
    let bestSelectionUse = Number.POSITIVE_INFINITY;

    candidates.forEach((candidate, candidateIndex) => {
      let minimumDistance = Number.POSITIVE_INFINITY;
      let totalDistance = 0;

      for (const existing of selected) {
        const distance = candidateDistance(candidate, existing);
        minimumDistance = Math.min(minimumDistance, distance);
        totalDistance += distance;
      }

      const averageDistance = totalDistance / selected.length;
      const used = selectionUse.get(candidate.selectionKey) ?? 0;
      const isBetter =
        minimumDistance > bestMinimumDistance ||
        (minimumDistance === bestMinimumDistance && used < bestSelectionUse) ||
        (minimumDistance === bestMinimumDistance &&
          used === bestSelectionUse &&
          averageDistance > bestAverageDistance);

      if (isBetter) {
        bestIndex = candidateIndex;
        bestMinimumDistance = minimumDistance;
        bestAverageDistance = averageDistance;
        bestSelectionUse = used;
      }
    });

    const [next] = candidates.splice(bestIndex, 1);
    selected.push(next);
    selectionUse.set(next.selectionKey, (selectionUse.get(next.selectionKey) ?? 0) + 1);
  }

  return selected.map((candidate) => candidate.ids);
}

export const bingoCardCatalog = buildCatalog();
