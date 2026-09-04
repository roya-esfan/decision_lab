export type CourseDay = {
  number: number;
  week: number;
  title: string;
  room: string;
  dateISO: string;
  date: string;
  time: string;
  topics: string[];
  readings: {
    required: string[];
    recommended: string[];
    further?: string[];
  };
  sessions: CourseSession[];
  assignments: CourseAssignment[];
};

export type CourseSession = {
  time: string;
  label: string;
  duration: string;
  description?: string;
  kind: "teaching" | "break";
};

export type CourseAssignment = {
  number: number;
  title: string;
  description: string;
  href: string;
  status: "ready" | "planned";
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
    week: 38,
    title: "Foundations of Decision Making",
    room: "P35 PI254",
    dateISO: "2026-09-14",
    date: "Monday, 14 September 2026",
    time: "08:30–10:15",
    topics: [
      "Introduction to the course",
      "Normative, descriptive and prescriptive approaches",
      "Decision quality versus outcomes",
      "The anatomy of a decision",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 1: Introduction to Managerial Decision Making.",
      ],
      recommended: ["Kahneman, Chapter 1: The Characters of the Story."],
    },
    sessions: [
      {
        time: "08:30–09:15",
        label: "Session 1",
        duration: "45 min",
        description:
          "Introduction, life-experience bingo, and why study decision making",
        kind: "teaching",
      },
      {
        time: "09:15–09:30",
        label: "Break",
        duration: "15 min",
        kind: "break",
      },
      {
        time: "09:30–10:15",
        label: "Session 2",
        duration: "45 min",
        description:
          "Normative, descriptive and prescriptive approaches; decision quality versus outcome; and the anatomy of a decision",
        kind: "teaching",
      },
    ],
    assignments: [
      {
        number: 1,
        title: "Life experience bingo – Judgement and decision making edition",
        description: "What decision-making experiences can you relate to?",
        href: "/day/1/life-experience-bingo",
        status: "ready",
      },
      {
        number: 2,
        title: "A two-player bargain",
        description: "Respond to three offers",
        href: "/day/1/assignment-1",
        status: "ready",
      },
      {
        number: 3,
        title: "Evaluate the decision",
        description: "Rate three decisions",
        href: "/day/1/evaluate-the-decision",
        status: "ready",
      },
      {
        number: 4,
        title: "Which exam results feel better?",
        description: "Choose based on your immediate reaction",
        href: "/day/1/assignment-2",
        status: "ready",
      },
      {
        number: 5,
        title: "Make a rational decision",
        description: "Apply six steps to a problem of your own and compare weighted alternatives",
        href: "/day/1/assignment-3",
        status: "ready",
      },
    ],
  },
  {
    number: 2,
    week: 38,
    title: "Bounded Rationality, Dual-Process Thinking, Biases, and Heuristics",
    room: "P50 G233",
    dateISO: "2026-09-15",
    date: "Tuesday, 15 September 2026",
    time: "12:30–17:15",
    topics: [
      "Bounded rationality and satisficing",
      "Dual-process theories: System 1 and System 2",
      "Availability, representativeness, anchoring and confirmation",
      "Bias and unwanted variability (noise)",
      "Coursework workshop: self-nudging and choice architecture",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 3: Common Biases.",
        "Review Bazerman & Moore, Chapter 1: System 1 and System 2 Thinking.",
      ],
      recommended: [
        "Kahneman, Chapters 11 and 15.",
        "Tversky & Kahneman (1974), Judgment under uncertainty: Heuristics and biases.",
        "Kahneman et al. (2016), Noise: How to overcome the high, hidden cost of inconsistent decision making.",
      ],
      further: [
        "Rau & Bromiley (2025), A review of cognitive biases in strategic decision making.",
      ],
    },
    sessions: [],
    assignments: [
      {
        number: 1,
        title: "How do you prefer to think?",
        description:
          "Complete the REI-10 and explore your cognitive style",
        href: "/day/2/rei-10",
        status: "ready",
      },
    ],
  },
  {
    number: 3,
    week: 38,
    title: "Risk, Framing, and Decisions Under Uncertainty",
    room: "P48 P372",
    dateISO: "2026-09-16",
    date: "Wednesday, 16 September 2026",
    time: "08:30–12:15",
    topics: [
      "Framing and equivalent descriptions",
      "Reference dependence and loss aversion",
      "Endowment effects, certainty and probability weighting",
      "Mental accounting",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 5: Framing and the Reversal of Preferences.",
      ],
      recommended: ["Kahneman, Chapters 26, 29 and 34."],
    },
    sessions: [],
    assignments: [],
  },
  {
    number: 4,
    week: 38,
    title: "Attention, Expertise, and Emotion",
    room: "P35 PI254",
    dateISO: "2026-09-17",
    date: "Thursday, 17 September 2026",
    time: "08:30–12:30",
    topics: [
      "Attention, cognitive effort and bounded awareness",
      "Experience, expertise and intuition",
      "Integral and incidental emotion",
      "Appraisal tendencies, emotion and risk",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 4: Bounded Awareness.",
        "Bazerman & Moore, Chapter 6: Motivational and Emotional Influences on Decision Making.",
      ],
      recommended: [
        "Kahneman, Chapters 3, 13 and 22.",
        "Lerner et al. (2015), Emotion and decision making.",
        "George & Dane (2016), Affect, emotion, and decision making.",
      ],
    },
    sessions: [],
    assignments: [],
  },
  {
    number: 5,
    week: 39,
    title: "Overconfidence, Influence, and Escalation of Commitment",
    room: "P35 PI251",
    dateISO: "2026-09-22",
    date: "Tuesday, 22 September 2026",
    time: "12:30–17:15",
    topics: [
      "Overconfidence, persuasion and influence",
      "Leader certainty and uncertainty",
      "Sunk costs, self-justification and escalation",
      "Learning from negative feedback and organizational safeguards",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 2: Overconfidence.",
        "Bazerman & Moore, Chapter 7: The Escalation of Commitment.",
      ],
      recommended: [
        "Kahneman, Chapters 20, 23 and 24.",
        "Cialdini (2001), Harnessing the science of persuasion.",
        "Alzahawi & Flynn (2025), Does expressing uncertainty help or harm leaders?",
        "Staw & Ross (1987), Knowing when to pull the plug.",
      ],
    },
    sessions: [],
    assignments: [],
  },
  {
    number: 6,
    week: 39,
    title: "Social Decision Making: Trust, Fairness, and Groups",
    room: "P48 P168",
    dateISO: "2026-09-23",
    date: "Wednesday, 23 September 2026",
    time: "12:30–15:15",
    topics: [
      "Interdependence and social dilemmas",
      "Trust, reciprocity and fairness",
      "Responses to unfairness and concern for others",
      "Group dynamics, bounded ethicality and favoritism",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 8: Fairness and Ethics in Decision Making.",
      ],
      recommended: [
        "Kouchaki & Smith (2025), Moral decision-making in organizations.",
      ],
    },
    sessions: [],
    assignments: [],
  },
  {
    number: 7,
    week: 39,
    title: "Improving Decisions: Debiasing and Decision Design",
    room: "P35 PI658",
    dateISO: "2026-09-24",
    date: "Thursday, 24 September 2026",
    time: "11:30–15:15",
    topics: [
      "Decision-analysis tools, debiasing and the outside view",
      "Choice architecture, nudges, boosts and sludge",
      "Ethics and evaluation of behavioral interventions",
      "Human–AI decision support",
    ],
    readings: {
      required: [
        "Bazerman & Moore, Chapter 12: Improving Decision Making.",
      ],
      recommended: [
        "Thaler & Sunstein, Chapters 4, 5, 8 and 15.",
        "Hertwig & Grüne-Yanoff (2017), Nudging and boosting.",
      ],
    },
    sessions: [],
    assignments: [],
  },
  {
    number: 8,
    week: 40,
    title: "Presentations and Course Summary",
    room: "P35 PI559",
    dateISO: "2026-09-28",
    date: "Monday, 28 September 2026",
    time: "08:30–13:15",
    topics: ["Group presentations", "Course synthesis and discussion"],
    readings: {
      required: [
        "No new reading. Review the relevant course material and Bazerman & Moore, Chapter 12.",
      ],
      recommended: [],
    },
    sessions: [],
    assignments: [],
  },
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
