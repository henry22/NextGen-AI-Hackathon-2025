"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api, handleApiError, withLoading } from "@/lib/api";
import { PerformanceChart } from "@/components/PerformanceChart";
import { AICoach } from "@/components/AICoach";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Trophy,
  Play,
  BookOpen,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Financial events data
const financialEvents = [
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

// AI Coaches data
const aiCoaches = [
  {
    id: "steady-sam",
    name: "Steady Sam",
    personality: "Conservative Coach",
    description: "Specialises in bonds, gold, and stable investment strategies",
    avatar: "🛡️",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "growth-guru",
    name: "Growth Guru",
    personality: "Balanced Coach",
    description: "Balanced investment approach mixing stocks, ETFs, and REITs",
    avatar: "⚖️",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "adventure-alex",
    name: "Adventure Alex",
    personality: "Aggressive Coach",
    description: "High-risk, high-reward crypto and growth stocks",
    avatar: "🚀",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "yield-yoda",
    name: "Yield Yoda",
    personality: "Income Coach",
    description: "Focuses on passive income and compound interest effects",
    avatar: "💰",
    color: "bg-yellow-100 text-yellow-800",
  },
];

// Detailed mission data for each financial event
const missionData = {
  1990: {
    context:
      "In 1990, Japan's economy was at the peak of its bubble. Tokyo real estate prices soared, and the Nikkei index hit historic highs. However, a crisis was brewing...",
    situation:
      "You have $100,000 in investment capital. The market is filled with optimism, but some economists are beginning to warn of bubble risks.",
    options: [
      {
        id: "stocks",
        name: "Japanese Stocks",
        description: "Invest in Nikkei 225 index fund",
        risk: "High",
        expectedReturn: "15-25%",
        actualReturn: -60,
      },
      {
        id: "realestate",
        name: "Tokyo Real Estate",
        description: "Purchase apartments in central Tokyo",
        risk: "High",
        expectedReturn: "20-30%",
        actualReturn: -70,
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "8-10%",
        actualReturn: 45,
      },
      {
        id: "gold",
        name: "Gold",
        description: "Invest in physical gold",
        risk: "Medium",
        expectedReturn: "5-8%",
        actualReturn: 20,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "I recommend diversifying investments, putting most of your funds into US Treasury bonds and gold. The Japanese market is too risky.",
      "growth-guru":
        "You can invest a small amount in the Japanese market, but maintain balance. I suggest 40% bonds, 30% stocks, 30% gold.",
      "adventure-alex":
        "This is a once-in-a-lifetime opportunity! Go all-in on Japanese stocks and real estate - the higher the risk, the higher the returns!",
      "yield-yoda":
        "Focus on assets that generate stable returns. US Treasury bonds may not have high returns, but they're the safest during turbulent times.",
    },
    outcome:
      "In 1991, the Bank of Japan began raising interest rates, and the bubble burst. Stock and real estate prices plummeted, beginning the 'Lost Decade'.",
  },
  1997: {
    context:
      "In July 1997, the Thai government announced the abandonment of the fixed exchange rate system between the Thai baht and the US dollar. This decision swept across Asia like a domino effect, triggering one of the most severe regional financial crises in history...",
    situation:
      "You have $100,000 in investment capital. Asian currencies are beginning to depreciate, stock markets are plummeting, but this also creates investment opportunities.",
    options: [
      {
        id: "asian-stocks",
        name: "Asian Stocks",
        description: "Invest in Korean, Thai, and Indonesian stock markets",
        risk: "Extreme",
        expectedReturn: "30-50%",
        actualReturn: -65,
      },
      {
        id: "us-stocks",
        name: "US Stocks",
        description: "Invest in S&P 500 index fund",
        risk: "Medium",
        expectedReturn: "12-18%",
        actualReturn: 28,
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "6-8%",
        actualReturn: 15,
      },
      {
        id: "cash",
        name: "US Dollar Cash",
        description: "Hold US dollars and wait for opportunities",
        risk: "None",
        expectedReturn: "4-5%",
        actualReturn: 8,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "Asian markets are too dangerous! I recommend holding US Treasury bonds and cash, waiting for the storm to pass.",
      "growth-guru":
        "You can moderately invest in US stocks, but avoid Asian markets. I suggest 60% US stocks, 40% bonds.",
      "adventure-alex":
        "Crisis creates opportunity! Asian stocks are super cheap now, it's a great time to buy the dip!",
      "yield-yoda":
        "In uncertain times, cash is king. Maintain liquidity and wait for better investment opportunities.",
    },
    outcome:
      "The Asian financial crisis continued until 1998, with many currencies depreciating by more than 50% and stock markets falling by 60-80%. The US market remained relatively stable, becoming a safe haven for capital.",
  },
  2000: {
    context:
      "In 2000, the internet revolution was changing the world. Tech stock prices soared, and people believed the 'new economy' would forever change investment rules...",
    situation:
      "You have $100,000 in investment capital. The Nasdaq index has risen 400% over the past 5 years, and tech company valuations have reached astronomical levels.",
    options: [
      {
        id: "tech",
        name: "Tech Stocks",
        description: "Invest in Nasdaq 100 index",
        risk: "High",
        expectedReturn: "25-40%",
        actualReturn: -78,
      },
      {
        id: "dotcom",
        name: "Dot-com Startups",
        description: "Invest in .com company stocks",
        risk: "Extreme",
        expectedReturn: "50-100%",
        actualReturn: -95,
      },
      {
        id: "traditional",
        name: "Traditional Stocks",
        description: "Invest in Dow Jones Industrial Average",
        risk: "Medium",
        expectedReturn: "10-15%",
        actualReturn: -25,
      },
      {
        id: "cash",
        name: "Cash",
        description: "Hold cash and wait for opportunities",
        risk: "None",
        expectedReturn: "3-5%",
        actualReturn: 15,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "The market is overheated! I recommend holding cash and waiting for a better entry point.",
      "growth-guru":
        "You can moderately participate in tech stocks, but control the proportion. I suggest 50% cash, 30% traditional stocks, 20% tech stocks.",
      "adventure-alex":
        "The internet revolution has just begun! Go all-in on .com companies - this is a historic opportunity!",
      "yield-yoda":
        "High valuations mean low future returns. Stay patient, cash is king.",
    },
    outcome:
      "In March 2000, the dot-com bubble burst. The Nasdaq index fell 78% over the next two years, and many .com companies went bankrupt.",
  },
  2008: {
    context:
      "In September 2008, Lehman Brothers declared bankruptcy, triggering a global financial tsunami. The subprime mortgage crisis spread from the US to the world, and the banking system faced collapse...",
    situation:
      "You have $100,000 in investment capital. Global stock markets are plummeting, credit markets are frozen, but central banks are beginning massive rescue operations.",
    options: [
      {
        id: "stocks",
        name: "Global Stocks",
        description: "Invest in MSCI World Index",
        risk: "Extreme",
        expectedReturn: "20-30%",
        actualReturn: -55,
      },
      {
        id: "banks",
        name: "Banking Stocks",
        description: "Invest in financial sector stocks",
        risk: "Extreme",
        expectedReturn: "40-60%",
        actualReturn: -75,
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "4-6%",
        actualReturn: 25,
      },
      {
        id: "gold",
        name: "Gold",
        description: "Invest in physical gold",
        risk: "Medium",
        expectedReturn: "8-12%",
        actualReturn: 35,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "This is a once-in-a-century crisis! Go all-in on US Treasury bonds and gold, stay away from the stock market.",
      "growth-guru":
        "Stay calm during the crisis. I suggest 70% bonds, 20% gold, 10% stocks, entering in batches.",
      "adventure-alex":
        "Stocks are super cheap now! This is a once-in-a-lifetime opportunity to buy the dip - go all-in!",
      "yield-yoda":
        "Stay rational in panic. Treasury bonds and gold are the safest havens.",
    },
    outcome:
      "In 2008-2009, global stock markets fell by more than 50%, but US Treasury bonds and gold became safe-haven assets. Central banks implemented massive quantitative easing, laying the foundation for subsequent recovery.",
  },
  2020: {
    context:
      "In March 2020, the COVID-19 pandemic spread globally, and countries implemented lockdown measures. Stock markets plummeted 30% in just one month, but unprecedented central bank stimulus policies were about to emerge...",
    situation:
      "You have $100,000 in investment capital. Market panic has reached its peak, but tech stocks are beginning to show resilience.",
    options: [
      {
        id: "tech-stocks",
        name: "Tech Stocks",
        description: "Invest in FAANG and other tech giants",
        risk: "Medium",
        expectedReturn: "15-25%",
        actualReturn: 85,
      },
      {
        id: "travel-stocks",
        name: "Travel & Airlines",
        description: "Invest in airline, cruise, and hotel stocks",
        risk: "Extreme",
        expectedReturn: "50-100%",
        actualReturn: -45,
      },
      {
        id: "bonds",
        name: "US Treasury Bonds",
        description: "Purchase 10-year US Treasury bonds",
        risk: "Low",
        expectedReturn: "2-4%",
        actualReturn: 12,
      },
      {
        id: "gold",
        name: "Gold",
        description: "Invest in physical gold",
        risk: "Medium",
        expectedReturn: "8-15%",
        actualReturn: 28,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "The pandemic's impact is hard to predict. I recommend investing in safe-haven assets like Treasury bonds and gold.",
      "growth-guru":
        "Tech stocks benefit from digital transformation and can be moderately allocated. I suggest 50% tech stocks, 30% bonds, 20% gold.",
      "adventure-alex":
        "Travel stocks have hit rock bottom. The pandemic will end eventually - now is the perfect time to buy the dip!",
      "yield-yoda":
        "Focus on pandemic-benefiting industries like tech, healthcare, and e-commerce.",
    },
    outcome:
      "In the second half of 2020, tech stocks surged, and travel stocks rebounded after vaccines emerged, but overall tech stocks performed best. Central banks' massive money printing pushed up asset prices.",
  },
  2025: {
    context:
      "In 2025, the world faces multiple challenges including inflationary pressures, central bank rate hikes, and geopolitical tensions. The AI revolution is changing industry landscapes, but market volatility is intensifying...",
    situation:
      "You have $100,000 in investment capital. Inflation remains high, interest rates are at multi-year highs, but AI and green energy industries are showing strong growth.",
    options: [
      {
        id: "ai-stocks",
        name: "AI Tech Stocks",
        description: "Invest in artificial intelligence related companies",
        risk: "High",
        expectedReturn: "20-40%",
        actualReturn: 0, // Future results to be determined
      },
      {
        id: "energy",
        name: "Green Energy Stocks",
        description: "Invest in solar, wind and other green energy",
        risk: "High",
        expectedReturn: "15-30%",
        actualReturn: 0,
      },
      {
        id: "tips",
        name: "Inflation-Protected Bonds",
        description: "Purchase Treasury Inflation-Protected Securities (TIPS)",
        risk: "Low",
        expectedReturn: "5-8%",
        actualReturn: 0,
      },
      {
        id: "commodities",
        name: "Commodities",
        description: "Invest in oil, gold, and agricultural products",
        risk: "Medium",
        expectedReturn: "10-20%",
        actualReturn: 0,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "In uncertain times, I recommend investing in inflation-protected bonds and commodities to preserve value.",
      "growth-guru":
        "AI is the future trend, but balance the risks. I suggest 40% AI stocks, 30% inflation-protected bonds, 30% commodities.",
      "adventure-alex":
        "The AI revolution has just begun! Go all-in on AI tech stocks - this is the theme of the next decade!",
      "yield-yoda":
        "In an inflationary environment, physical assets and inflation-protected bonds are the best choices.",
    },
    outcome:
      "This is a current ongoing event, and the results are yet to be determined. Your investment decisions will impact future wealth accumulation!",
  },
};

export default function FinancialTimelineGame() {
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof financialEvents)[0] | null
  >(null);
  const [selectedCoach, setSelectedCoach] = useState(aiCoaches[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [coachAdvice, setCoachAdvice] = useState<any>(null);

  // Mission game state management
  const [missionStep, setMissionStep] = useState<
    "intro" | "decision" | "result"
  >("intro");
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(
    null
  );
  const [missionResult, setMissionResult] = useState<any>(null);

  const updateUnlockStatus = () => {
    financialEvents.forEach((event) => {
      if (event.unlockRequirements.length > 0) {
        const allRequirementsMet = event.unlockRequirements.every(
          (requiredYear) => {
            const requiredEvent = financialEvents.find(
              (e) => e.year === requiredYear
            );
            return requiredEvent?.completed === true;
          }
        );
        event.unlocked = allRequirementsMet;
      }
    });
  };

  useEffect(() => {
    updateUnlockStatus();
  }, []);

  const handleEventClick = async (event: (typeof financialEvents)[0]) => {
    if (event.unlocked) {
      setSelectedEvent(event);

      // Load price data for the mission
      try {
        await withLoading(
          api.getPrices(["VTI", "BND", "GLD"], "1y"),
          setApiLoading
        );
      } catch (error) {
        setApiError(handleApiError(error));
      }
    }
  };

  const startMission = () => {
    if (selectedEvent) {
      setGameStarted(true);
      setMissionStep("intro");
    }
  };

  const makeInvestment = async (optionId: string) => {
    if (!selectedEvent) return;

    const mission = missionData[selectedEvent.year as keyof typeof missionData];
    const option = mission.options.find((opt) => opt.id === optionId);

    if (option) {
      setSelectedInvestment(optionId);

      // Simulate investment using API
      try {
        const simulationRequest = {
          initial_capital: 100000,
          asset_weights: {
            [option.name]: 1.0, // 100% allocation to selected option
          },
          trading_type: "open" as const,
          investment_goal: "balanced" as const,
          time_horizon: 365,
        };

        const result = await withLoading(
          api.simulateInvestment(simulationRequest),
          setApiLoading
        );

        setSimulationResult(result);
      } catch (error) {
        setApiError(handleApiError(error));
      }

      setMissionResult({
        option,
        actualReturn: option.actualReturn,
        finalAmount: 100000 * (1 + option.actualReturn / 100),
        performance: option.actualReturn > 0 ? "profit" : "loss",
      });
      setMissionStep("result");
    }
  };

  const completeMission = () => {
    if (selectedEvent && missionResult) {
      const baseReward = selectedEvent.reward;
      const performanceBonus = missionResult.performance === "profit" ? 50 : 0;
      const totalReward = baseReward + performanceBonus;

      setPlayerXP((prev) => prev + totalReward);
      setTotalScore((prev) => prev + totalReward);

      setCompletedMissions((prev) => [...prev, selectedEvent.title]);

      const eventIndex = financialEvents.findIndex(
        (e) => e.year === selectedEvent.year
      );
      if (eventIndex !== -1) {
        financialEvents[eventIndex].completed = true;
        // Update unlock status for other events
        updateUnlockStatus();
      }

      setGameStarted(false);
      setSelectedEvent(null);
      setMissionStep("intro");
      setSelectedInvestment(null);
      setMissionResult(null);
    }
  };

  const allMissionsCompleted = financialEvents.every(
    (event) => event.completed
  );

  useEffect(() => {
    if (allMissionsCompleted && !showSummary) {
      setTimeout(() => setShowSummary(true), 1000);
    }
  }, [allMissionsCompleted, showSummary]);

  const calculateLearningStats = () => {
    const totalMissions = financialEvents.length;
    const completedCount = financialEvents.filter((e) => e.completed).length;
    const totalXPEarned = playerXP;
    const averageScore =
      completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

    return {
      totalMissions,
      completedCount,
      totalXPEarned,
      averageScore,
      completionRate: Math.round((completedCount / totalMissions) * 100),
    };
  };

  const generateLearningInsights = () => {
    const insights = [];
    const stats = calculateLearningStats();

    if (stats.averageScore >= 200) {
      insights.push(
        "🎯 Investment Decision Expert: You made wise investment choices in most missions!"
      );
    } else if (stats.averageScore >= 150) {
      insights.push(
        "📈 Steady Investor: You demonstrated good risk control abilities."
      );
    } else {
      insights.push(
        "🌱 Learning Grower: Every failure is a valuable learning experience, keep going!"
      );
    }

    if (playerXP >= 1000) {
      insights.push(
        "🏆 Financial Knowledge Master: You have mastered rich financial history knowledge!"
      );
    }

    insights.push(
      "💡 Risk Management: Learned to assess investment risks in different market environments"
    );
    insights.push(
      "📊 Historical Insights: Understood the causes and impact patterns of financial crises"
    );
    insights.push(
      "🎓 Investment Strategy: Mastered the importance of diversified investing and asset allocation"
    );

    return insights;
  };

  const currentMission = selectedEvent
    ? missionData[selectedEvent.year as keyof typeof missionData]
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-black text-primary">
                Legacy Guardians
              </h1>
              <p className="text-sm text-muted-foreground">
                Time-Warp Wealth Adventure
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Level {playerLevel}</p>
                <p className="text-xs text-muted-foreground">{playerXP} XP</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Total Score</p>
                <p className="text-lg font-bold text-primary">{totalScore}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* AI Coaches Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  AI Coach Team
                </CardTitle>
                <CardDescription>Choose your investment mentor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCoach.id === coach.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCoach(coach)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{coach.avatar}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{coach.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {coach.personality}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">
                      {coach.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Experience Points</span>
                      <span>{playerXP}/1000</span>
                    </div>
                    <Progress value={(playerXP / 1000) * 100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {financialEvents.filter((e) => e.completed).length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed Missions
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">
                        {financialEvents.filter((e) => e.unlocked).length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available Missions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Timeline */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Financial History Timeline
                </CardTitle>
                <CardDescription>
                  Travel through time and experience major financial events.
                  Click on events to start your investment missions!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

                  {/* Timeline Events */}
                  <div className="space-y-8">
                    {financialEvents.map((event, index) => (
                      <div
                        key={event.year}
                        className="relative flex items-start gap-6"
                      >
                        {/* Timeline Node */}
                        <div
                          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                            event.completed
                              ? "bg-primary border-primary text-primary-foreground"
                              : event.unlocked
                              ? "bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer"
                              : "bg-muted border-muted-foreground text-muted-foreground"
                          } transition-all duration-300`}
                          onClick={() => handleEventClick(event)}
                        >
                          {event.completed ? (
                            <Trophy className="h-6 w-6" />
                          ) : event.impact === "negative" ? (
                            <TrendingDown className="h-6 w-6" />
                          ) : event.impact === "mixed" ? (
                            <DollarSign className="h-6 w-6" />
                          ) : (
                            <TrendingUp className="h-6 w-6" />
                          )}
                        </div>

                        {/* Event Card */}
                        <div
                          className={`flex-1 ${
                            !event.unlocked ? "opacity-50" : ""
                          }`}
                        >
                          <Card
                            className={`transition-all duration-300 ${
                              event.unlocked
                                ? "hover:shadow-md cursor-pointer"
                                : ""
                            }`}
                            onClick={() => handleEventClick(event)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="font-serif text-lg">
                                    {event.year}
                                  </CardTitle>
                                  <CardDescription className="font-medium text-foreground mt-1">
                                    {event.title}
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={
                                      event.completed ? "default" : "secondary"
                                    }
                                  >
                                    {event.completed
                                      ? "Completed"
                                      : event.unlocked
                                      ? "Available"
                                      : "Locked"}
                                  </Badge>
                                  <Badge variant="outline">
                                    {event.difficulty === "beginner"
                                      ? "Beginner"
                                      : event.difficulty === "intermediate"
                                      ? "Intermediate"
                                      : event.difficulty === "advanced"
                                      ? "Advanced"
                                      : "Expert"}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                {event.description}
                              </p>
                              {!event.unlocked && event.unlockDescription && (
                                <div className="mb-3 p-2 bg-muted/50 rounded-md">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {event.unlockDescription}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                  <Trophy className="h-4 w-4 text-accent" />
                                  <span>{event.reward} XP</span>
                                </div>
                                {event.unlocked && !event.completed && (
                                  <Button size="sm" className="font-medium">
                                    <Play className="h-4 w-4 mr-1" />
                                    Start Mission
                                  </Button>
                                )}
                                {!event.unlocked && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="font-medium bg-transparent"
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Locked
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {selectedEvent?.year} - {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedEvent?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="font-medium">Reward XP</p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedEvent?.reward} XP
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="font-medium">Difficulty Level</p>
                    <p className="text-lg font-semibold">
                      {selectedEvent?.difficulty === "beginner"
                        ? "Beginner"
                        : selectedEvent?.difficulty === "intermediate"
                        ? "Intermediate"
                        : selectedEvent?.difficulty === "advanced"
                        ? "Advanced"
                        : "Expert"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-serif font-semibold mb-2">
                Your AI Coach: {selectedCoach.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedCoach.description}
              </p>
              <p className="text-sm">
                <span className="font-medium">Recommended Strategy: </span>
                {selectedCoach.id === "steady-sam" &&
                  "Stay calm during crises and choose defensive assets like bonds and gold."}
                {selectedCoach.id === "growth-guru" &&
                  "Balance risk and opportunity by diversifying across different asset classes."}
                {selectedCoach.id === "adventure-alex" &&
                  "Crisis creates opportunity! Look for undervalued high-growth potential investments."}
                {selectedCoach.id === "yield-yoda" &&
                  "Focus on investments that generate stable cash flow and let compound interest work for you."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={startMission} className="flex-1 font-medium">
                <Play className="h-4 w-4 mr-2" />
                Start Time Mission
              </Button>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Challenge Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={gameStarted}
        onOpenChange={() => {
          setGameStarted(false);
          setSelectedEvent(null);
          setMissionStep("intro");
          setSelectedInvestment(null);
          setMissionResult(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {currentMission && (
            <>
              {/* Mission Introduction */}
              {missionStep === "intro" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      Time Travel: {selectedEvent?.year}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedEvent?.title}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Historical Background
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentMission.context}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          Investment Situation
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentMission.situation}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-accent/10">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <span className="text-2xl">
                            {selectedCoach.avatar}
                          </span>
                          {selectedCoach.name}'s Advice
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {
                            currentMission.coachAdvice[
                              selectedCoach.id as keyof typeof currentMission.coachAdvice
                            ]
                          }
                        </p>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setMissionStep("decision")}
                        className="flex-1 font-medium"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Start Investment Decision
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGameStarted(false);
                          setSelectedEvent(null);
                          setMissionStep("intro");
                          setSelectedInvestment(null);
                          setMissionResult(null);
                        }}
                      >
                        Exit Mission
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Investment Decision */}
              {missionStep === "decision" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      Investment Decision Time
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Choose your investment strategy - each choice will affect
                      the final outcome
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentMission.options.map((option) => (
                        <Card
                          key={option.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedInvestment === option.id
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => setSelectedInvestment(option.id)}
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{option.name}</h4>
                                <Badge
                                  variant={
                                    option.risk === "極高"
                                      ? "destructive"
                                      : option.risk === "高"
                                      ? "secondary"
                                      : option.risk === "中"
                                      ? "outline"
                                      : "default"
                                  }
                                >
                                  {option.risk} Risk
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                <span>
                                  Expected Return: {option.expectedReturn}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() =>
                          selectedInvestment &&
                          makeInvestment(selectedInvestment)
                        }
                        disabled={!selectedInvestment}
                        className="flex-1 font-medium"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Confirm Investment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setMissionStep("intro")}
                      >
                        Reconsider
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Mission Result */}
              {missionStep === "result" && missionResult && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                      {missionResult.performance === "profit" ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      )}
                      Mission Results
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Let's see how your investment decision turned out
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Card
                      className={`${
                        missionResult.performance === "profit"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              You chose
                            </p>
                            <p className="text-xl font-bold">
                              {missionResult.option.name}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Initial Investment
                              </p>
                              <p className="text-lg font-semibold">$100,000</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Actual Return Rate
                              </p>
                              <p
                                className={`text-lg font-semibold ${
                                  missionResult.performance === "profit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {missionResult.actualReturn > 0 ? "+" : ""}
                                {missionResult.actualReturn}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Final Amount
                              </p>
                              <p
                                className={`text-lg font-semibold ${
                                  missionResult.performance === "profit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                ${missionResult.finalAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3">
                          Historical Truth
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentMission.outcome}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-accent/10">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-accent" />
                          Rewards Earned
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">
                              Base XP: {selectedEvent?.reward} XP
                            </p>
                            {missionResult.performance === "profit" && (
                              <p className="text-sm text-green-600">
                                Performance Bonus: +50 XP
                              </p>
                            )}
                          </div>
                          <p className="text-xl font-bold text-primary">
                            Total:
                            {(selectedEvent?.reward || 0) +
                              (missionResult.performance === "profit"
                                ? 50
                                : 0)}{" "}
                            XP
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Coach Section */}
                    {simulationResult && (
                      <div className="mt-6">
                        <AICoach
                          playerLevel={
                            playerLevel === 1
                              ? "beginner"
                              : playerLevel === 2
                              ? "intermediate"
                              : "advanced"
                          }
                          currentPortfolio={{
                            [missionResult.option.name]: 1.0,
                          }}
                          investmentGoal="balanced"
                          riskTolerance={0.5}
                          completedMissions={completedMissions}
                          currentMission={selectedEvent?.title}
                          onAdviceReceived={setCoachAdvice}
                        />
                      </div>
                    )}

                    {/* Performance Chart */}
                    {simulationResult && simulationResult.performance_chart && (
                      <div className="mt-6">
                        <PerformanceChart
                          data={simulationResult.performance_chart}
                          initialValue={100000}
                          finalValue={simulationResult.final_value || 100000}
                          totalReturn={simulationResult.total_return || 0}
                          volatility={simulationResult.volatility || 0.15}
                          sharpeRatio={simulationResult.sharpe_ratio || 0.5}
                          maxDrawdown={simulationResult.max_drawdown || -0.1}
                        />
                      </div>
                    )}

                    <Button
                      onClick={completeMission}
                      className="w-full font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Mission
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-center flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Congratulations! Learning Mission Complete
              <Trophy className="h-8 w-8 text-yellow-500" />
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              You have successfully travelled through the important moments of
              financial history. It's time to review your learning achievements!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Achievement Banner */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎓</div>
                  <h3 className="font-serif text-2xl font-bold">
                    Time-Travel Investment Master
                  </h3>
                  <p className="text-muted-foreground">
                    You have mastered the important financial events from 1990
                    to 2025, becoming a true investment time traveller!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Learning Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {calculateLearningStats().completedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed Missions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">{playerXP}</p>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {calculateLearningStats().averageScore}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {calculateLearningStats().completionRate}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completion Rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Learning Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Learning Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateLearningInsights().map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="text-lg">{insight.split(" ")[0]}</div>
                      <p className="text-sm flex-1">
                        {insight.substring(insight.indexOf(" ") + 1)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mission Timeline Review */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Your Time-Travel Journey Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialEvents.map((event) => (
                    <div
                      key={event.year}
                      className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {event.year} - {event.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Earned {event.reward} XP
                        </p>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Learning Points */}
            <Card className="bg-accent/10">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Key Learning Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      💰 Investment Principles
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Diversify investments to reduce risk</li>
                      <li>
                        • Long-term investing beats short-term speculation
                      </li>
                      <li>• Stay calm and rational during crises</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📈 Market Insights</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Bubbles always burst</li>
                      <li>• Crises create investment opportunities</li>
                      <li>• History repeats but never exactly the same</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Next Learning Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    🎯 <strong>Practical Application:</strong>
                    Start with small investments and apply your knowledge to
                    real life
                  </p>
                  <p className="text-sm">
                    📚 <strong>Deep Learning:</strong> Read more financial books
                    to understand investment theory
                  </p>
                  <p className="text-sm">
                    🌐 <strong>Stay Informed:</strong>
                    Follow current market trends and develop investment
                    sensitivity
                  </p>
                  <p className="text-sm">
                    👥 <strong>Share & Discuss:</strong> Share your financial
                    knowledge with friends and family
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowSummary(false)}
                className="flex-1 font-medium"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Save Learning Results
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Restart Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
