export interface AICoach {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  color: string;
  animatedAvatar: string;
}

export const aiCoaches: AICoach[] = [
  {
    id: "steady-sam",
    name: "Steady Sam",
    personality: "Conservative Coach",
    description: "Specialises in bonds, gold, and stable investment strategies",
    avatar: "/avatars/conservative.png",
    color: "bg-blue-100 text-blue-800",
    animatedAvatar: "/gifs/conservative.gif",
  },
  {
    id: "growth-guru",
    name: "Growth Guru",
    personality: "Balanced Coach",
    description: "Balanced investment approach mixing stocks, ETFs, and REITs",
    avatar: "/avatars/balanced.png",
    color: "bg-green-100 text-green-800",
    animatedAvatar: "/gifs/balanced.gif",
  },
  {
    id: "adventure-alex",
    name: "Adventure Alex",
    personality: "Aggressive Coach",
    description: "High-risk, high-reward crypto and growth stocks",
    avatar: "/avatars/aggressive.png",
    color: "bg-purple-100 text-purple-800",
    animatedAvatar: "/gifs/aggressive.gif",
  },
  {
    id: "yield-yoda",
    name: "Yield Yoda",
    personality: "Income Coach",
    description: "Focuses on passive income and compound interest effects",
    avatar: "/avatars/master.png",
    color: "bg-yellow-100 text-yellow-800",
    animatedAvatar: "/gifs/master.gif",
  },
];