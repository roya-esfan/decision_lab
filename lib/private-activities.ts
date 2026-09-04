export const privateActivityKeys = [
  "life-experience-bingo",
  "rational-decision",
  "rei-10",
] as const;

export type PrivateActivityKey = (typeof privateActivityKeys)[number];

export function isPrivateActivityKey(value: string): value is PrivateActivityKey {
  return privateActivityKeys.includes(value as PrivateActivityKey);
}
