export const rareDiseaseConditions = {
  A: "antidote",
  B: "exposure",
} as const;

export type RareDiseaseConditionLetter = keyof typeof rareDiseaseConditions;
export type RareDiseaseCondition = (typeof rareDiseaseConditions)[RareDiseaseConditionLetter];

export const maximumValuationNok = 1_000_000_000;
const encodedValuationPattern = /^(A|B):(0|[1-9][0-9]{0,9})$/;

export function encodeRareDiseaseValuation(
  condition: RareDiseaseConditionLetter,
  amount: number,
) {
  return `${condition}:${amount}`;
}

export function isEncodedRareDiseaseValuation(value: string) {
  const match = encodedValuationPattern.exec(value);
  if (!match) return false;
  const amount = Number(match[2]);
  return Number.isSafeInteger(amount) && amount >= 0 && amount <= maximumValuationNok;
}

export function summarizeRareDiseaseValuations(counts: Record<string, number>) {
  return ([
    { condition: "A", label: "Antidote", measure: "Maximum willingness to pay" },
    { condition: "B", label: "Exposure", measure: "Minimum compensation demanded" },
  ] as const).map((definition) => {
    const amounts: number[] = [];
    for (const [encoded, count] of Object.entries(counts)) {
      if (!isEncodedRareDiseaseValuation(encoded)) continue;
      const [condition, amountText] = encoded.split(":");
      if (condition !== definition.condition) continue;
      const amount = Number(amountText);
      for (let index = 0; index < count; index += 1) amounts.push(amount);
    }
    amounts.sort((a, b) => a - b);
    const total = amounts.length;
    const middle = Math.floor(total / 2);
    const median = total === 0
      ? null
      : total % 2 === 1
        ? amounts[middle]
        : (amounts[middle - 1] + amounts[middle]) / 2;
    const mean = total === 0
      ? null
      : amounts.reduce((sum, amount) => sum + amount, 0) / total;
    return { ...definition, total, median, mean };
  });
}
