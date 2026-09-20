export type BeerValuationGroup = "A" | "B";

export const maximumBeerPriceNok = 1_000_000;
const encodedBeerValuationPattern = /^(A|B):(0|[1-9][0-9]{0,6})$/;

export function encodeBeerValuation(group: BeerValuationGroup, amount: number) {
  return `${group}:${amount}`;
}

export function isEncodedBeerValuation(value: string) {
  const match = encodedBeerValuationPattern.exec(value);
  if (!match) return false;
  const amount = Number(match[2]);
  return Number.isSafeInteger(amount) && amount >= 0 && amount <= maximumBeerPriceNok;
}

export function summarizeBeerValuations(counts: Record<string, number>) {
  return ([
    { group: "A", label: "Fancy resort hotel", seller: "Bartender" },
    { group: "B", label: "Small run-down grocery store", seller: "Store owner" },
  ] as const).map((definition) => {
    const amounts: number[] = [];

    for (const [encoded, count] of Object.entries(counts)) {
      if (!isEncodedBeerValuation(encoded)) continue;
      const [group, amountText] = encoded.split(":");
      if (group !== definition.group) continue;
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
