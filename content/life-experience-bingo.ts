export type BingoExperience = {
  id: number;
  experience: string;
  concept: string;
};

export const bingoExperiences: BingoExperience[] = [
  {
    id: 1,
    experience: "Avoided switching because changing felt like too much effort",
    concept: "Status quo / inertia",
  },
  {
    id: 2,
    experience: "Continued with a plan because you already put time or money into it",
    concept: "Sunk cost / escalation",
  },
  {
    id: 3,
    experience: "Kept watching a bad movie because you had already watched an hour",
    concept: "Sunk cost",
  },
  {
    id: 4,
    experience: "Felt worse about losing money than good about finding the same amount",
    concept: "Loss aversion",
  },
  {
    id: 5,
    experience: "Looked only at information that supported what you already thought",
    concept: "Confirmation bias",
  },
  {
    id: 6,
    experience: "Automatically chosen the middle option when given three choices",
    concept: "Compromise effect",
  },
  {
    id: 7,
    experience: "Paid extra for something because you had already spent a lot on the overall experience",
    concept: "Sunk cost",
  },
  {
    id: 8,
    experience: "Kept something you would not buy again today, simply because you already own it",
    concept: "Endowment effect / status quo",
  },
  {
    id: 9,
    experience: "Felt differently about spending ‘gift money’ than money you earned",
    concept: "Mental accounting",
  },
  {
    id: 10,
    experience: "Bought something you did not really need to reach a free-shipping minimum",
    concept: "Choice architecture / threshold effect",
  },
  {
    id: 11,
    experience: "Missed an opportunity because you spent too long trying to make the ‘best choice’",
    concept: "Maximizing / bounded rationality",
  },
  {
    id: 12,
    experience: "Gone back to a restaurant you thought was only okay because at least you knew what you would get",
    concept: "Satisficing / status quo",
  },
  {
    id: 13,
    experience: "Preferred a gamble after losing something because you wanted to get back to even",
    concept: "Risk seeking in losses",
  },
  {
    id: 14,
    experience: "Defended a choice more strongly after you made it than before you made it",
    concept: "Self-justification",
  },
  {
    id: 15,
    experience: "Chosen a guaranteed reward even when another option offered a better overall chance of getting more",
    concept: "Certainty effect",
  },
  {
    id: 16,
    experience: "Defended a decision even more strongly after someone questioned whether it was the right one",
    concept: "Self-justification / escalation",
  },
  {
    id: 18,
    experience: "Valued something more after it became yours than you did before you owned it",
    concept: "Endowment effect",
  },
  {
    id: 19,
    experience: "Judged a decision as good mainly because it happened to turn out well",
    concept: "Outcome bias",
  },
  {
    id: 20,
    experience: "Thought you had made a bad decision because the outcome was bad, even though you had made a careful choice with the information available",
    concept: "Outcome bias / decision quality ≠ outcome",
  },
];

const sunkCostIds = [2, 3, 7];
const selfJustificationIds = [14, 16];
const endowmentIds = [8, 18];

function randomIndex(length: number) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
}

function randomItem<T>(items: readonly T[]): T {
  return items[randomIndex(items.length)];
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function generateBingoCard(): BingoExperience[] {
  const excludedIds = new Set<number>([
    randomItem(sunkCostIds),
    randomItem(selfJustificationIds),
    randomItem(endowmentIds),
  ]);

  return shuffle(
    bingoExperiences.filter((item) => !excludedIds.has(item.id)),
  );
}
