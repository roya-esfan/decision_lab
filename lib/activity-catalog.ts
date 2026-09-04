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
];

export function isControlledActivityKey(value: unknown): value is ControlledActivityKey {
  return typeof value === "string"
    && controlledActivityKeys.includes(value as ControlledActivityKey);
}

export function isResponseActivityKey(value: ControlledActivityKey): value is ActivityKey {
  return activityKeys.includes(value as ActivityKey);
}

