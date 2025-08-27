export interface FinancialEvent {
  year: number;
  title: string;
  description: string;
  impact: "negative" | "positive" | "mixed";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  unlocked: boolean;
  completed: boolean;
  reward: number;
  unlockRequirements: number[];
  unlockDescription?: string;
}

export const financialEvents: FinancialEvent[] = [
  {
    year: 1990,
    title: "Japanese Bubble Economy Collapse",
    description:
      "The bursting of Japan's real estate and stock market bubbles marked the beginning of the lost decade",
    impact: "negative",
    difficulty: "beginner",
    unlocked: true,
    completed: false,
    reward: 100,
    unlockRequirements: [],
  },
  {
    year: 1997,
    title: "Asian Financial Crisis",
    description:
      "The financial crisis that began in Thailand swept across Asia",
    impact: "negative",
    difficulty: "intermediate",
    unlocked: true,
    completed: false,
    reward: 150,
    unlockRequirements: [],
  },
  {
    year: 2000,
    title: "Dot-com Bubble Burst",
    description: "Tech stocks plummeted, with the Nasdaq index falling by 78%",
    impact: "negative",
    difficulty: "intermediate",
    unlocked: true,
    completed: false,
    reward: 150,
    unlockRequirements: [],
  },
  {
    year: 2008,
    title: "Global Financial Crisis",
    description:
      "The subprime mortgage crisis triggered a global financial system collapse",
    impact: "negative",
    difficulty: "advanced",
    unlocked: true,
    completed: false,
    reward: 200,
    unlockRequirements: [1997, 2000],
  },
  {
    year: 2020,
    title: "COVID-19 Pandemic Impact",
    description:
      "Global pandemic caused economic shutdowns and extreme market volatility",
    impact: "mixed",
    difficulty: "advanced",
    unlocked: false,
    completed: false,
    reward: 250,
    unlockRequirements: [2008],
    unlockDescription:
      "Unlocked after completing '2008 - Global Financial Crisis' mission",
  },
  {
    year: 2025,
    title: "Current Challenges",
    description: "Inflation, rising interest rates, and geopolitical risks",
    impact: "mixed",
    difficulty: "expert",
    unlocked: false,
    completed: false,
    reward: 300,
    unlockRequirements: [2020],
    unlockDescription:
      "Unlocked after completing '2020 - COVID-19 Pandemic Impact' mission",
  },
];