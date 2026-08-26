export type CourseDay = {
  number: number;
  label: string;
  sessionCount: number;
  status: "ready" | "planned";
  description: string;
};

export type ReiItem = {
  id: string;
  text: string;
  dimension: "nfc" | "fi";
  reverse: boolean;
};

export const courseDays: CourseDay[] = [
  {
    number: 1,
    label: "Teaching day 01",
    sessionCount: 2,
    status: "ready",
    description: "The first activities and experiments for the course.",
  },
  ...Array.from({ length: 5 }, (_, index) => ({
    number: index + 2,
    label: `Teaching day 0${index + 2}`,
    sessionCount: index < 3 ? 2 : 1,
    status: "planned" as const,
    description: "Activities will be added as the course develops.",
  })),
];

export const rei10Items: ReiItem[] = [
  {
    id: "nfc-1",
    text: "I do not like to have to do a lot of thinking.",
    dimension: "nfc",
    reverse: true,
  },
  {
    id: "nfc-2",
    text: "I try to avoid situations that require thinking in depth about something.",
    dimension: "nfc",
    reverse: true,
  },
  {
    id: "nfc-3",
    text: "I prefer to do something that challenges my thinking abilities rather than something that requires little thought.",
    dimension: "nfc",
    reverse: false,
  },
  {
    id: "nfc-4",
    text: "I prefer complex to simple problems.",
    dimension: "nfc",
    reverse: false,
  },
  {
    id: "nfc-5",
    text: "Thinking hard and for a long time about something gives me little satisfaction.",
    dimension: "nfc",
    reverse: true,
  },
  {
    id: "fi-1",
    text: "I trust my initial feelings about people.",
    dimension: "fi",
    reverse: false,
  },
  {
    id: "fi-2",
    text: "I believe in trusting my hunches.",
    dimension: "fi",
    reverse: false,
  },
  {
    id: "fi-3",
    text: "My initial impressions of people are almost always right.",
    dimension: "fi",
    reverse: false,
  },
  {
    id: "fi-4",
    text: "When it comes to trusting people, I can usually rely on my “gut feelings.”",
    dimension: "fi",
    reverse: false,
  },
  {
    id: "fi-5",
    text: "I can usually feel when a person is right or wrong even if I cannot explain how I know.",
    dimension: "fi",
    reverse: false,
  },
];

export const rei10ResponseLabels = [
  "Completely false",
  "Mostly false",
  "Neither true nor false",
  "Mostly true",
  "Completely true",
] as const;
