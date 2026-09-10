import { activityKeys, type ActivityKey } from "./classroom";
import { privateActivityKeys, type PrivateActivityKey } from "./private-activities";

export const teachingDayNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type TeachingDayNumber = (typeof teachingDayNumbers)[number];

export const controlledActivityKeys = [
  ...activityKeys,
  ...privateActivityKeys,
] as const;

export type ControlledActivityKey = ActivityKey | PrivateActivityKey;

export type CourseActivityDefinition = {
  key: ControlledActivityKey;
  day: TeachingDayNumber;
  number: number;
  title: string;
  activityHref: string;
  kind: "responses" | "private";
  resultsPath?: string;
  completionLabel?: string;
};

export const courseActivityCatalog: readonly CourseActivityDefinition[] = [
  {
    key: "life-experience-bingo",
    day: 1,
    number: 1,
    title: "Life experience bingo",
    activityHref: "/day/1/life-experience-bingo",
    kind: "private",
    completionLabel: "reached bingo",
  },
  {
    key: "assignment-1",
    day: 1,
    number: 2,
    title: "A two-player bargain",
    activityHref: "/day/1/assignment-1",
    resultsPath: "/day/1/assignment-1/results",
    kind: "responses",
  },
  {
    key: "outcome-bias",
    day: 1,
    number: 3,
    title: "Evaluate the decision",
    activityHref: "/day/1/evaluate-the-decision",
    resultsPath: "/day/1/evaluate-the-decision/results",
    kind: "responses",
  },
  {
    key: "assignment-2",
    day: 1,
    number: 4,
    title: "Which exam results feel better?",
    activityHref: "/day/1/assignment-2",
    resultsPath: "/day/1/assignment-2/results",
    kind: "responses",
  },
  {
    key: "rational-decision",
    day: 1,
    number: 5,
    title: "Make a rational decision",
    activityHref: "/day/1/assignment-3",
    kind: "private",
    completionLabel: "finished",
  },
  {
    key: "rei-10",
    day: 2,
    number: 1,
    title: "How do you prefer to think?",
    activityHref: "/day/2/rei-10",
    kind: "private",
    completionLabel: "finished",
  },
  {
    key: "company-revenue",
    day: 2,
    number: 2,
    title: "Which group had larger sales?",
    activityHref: "/day/2/company-revenue",
    resultsPath: "/day/2/company-revenue/results",
    kind: "responses",
  },
  {
    key: "causes-of-death",
    day: 2,
    number: 3,
    title: "Rank the causes of death",
    activityHref: "/day/2/causes-of-death",
    resultsPath: "/day/2/causes-of-death/results",
    kind: "responses",
  },
  {
    key: "crew-problem",
    day: 3,
    number: 1,
    title: "Crew problem",
    activityHref: "/day/3/crew-problem",
    resultsPath: "/day/3/crew-problem/results",
    kind: "responses",
  },
  {
    key: "school-bag-framing",
    day: 3,
    number: 2,
    title: "Gain or loss?",
    activityHref: "/day/3/school-bag-framing",
    resultsPath: "/day/3/school-bag-framing/results",
    kind: "responses",
  },
];

export function isControlledActivityKey(value: unknown): value is ControlledActivityKey {
  return typeof value === "string"
    && controlledActivityKeys.includes(value as ControlledActivityKey);
}

export function isResponseActivityKey(value: ControlledActivityKey): value is ActivityKey {
  return activityKeys.includes(value as ActivityKey);
}
