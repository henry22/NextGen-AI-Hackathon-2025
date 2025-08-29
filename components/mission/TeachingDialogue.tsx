"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Trophy,
  DollarSign,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";
import { PerformanceChart } from "@/components/PerformanceChart";
import { api, InvestmentMetrics, CoachRequest, CoachResponse } from "@/lib/api";
import ReactMarkdown from "react-markdown";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TeachingDialogueProps {
  coach: {
    name: string;
    avatar: string;
    personality: string;
    color: string;
    description: string;
    animatedAvatar: string;
  };
  selectedOption: {
    name: string;
    id: string;
  };
  actualReturn: number;
  finalAmount: number;
  performance: "profit" | "loss";
  outcome: string;
  event: {
    title: string;
    description: string;
  };
  simulationResult?: any;
  onComplete: () => void;
}

interface TeachingMessage {
  id: string;
  type: "greeting" | "lesson" | "completion";
  content: string;
  showContinue?: boolean;
  showComplete?: boolean;
  showMetrics?: boolean;
  showChart?: boolean;
  showReturnsChart?: boolean;
  showAnalysis?: boolean;
}

// ============================================================================
// CONSTANTS & CONFIGURATIONS
// ============================================================================

const TICKER_MAP: Record<string, string> = {
  "Japanese Stocks": "^N225", // Nikkei 225
  "Tokyo Real Estate": "^N225", // Using Nikkei as proxy
  "US Treasury Bonds": "^TNX", // 10-year Treasury yield
  Gold: "GLD", // Gold ETF
  "US Dollar Cash": "UUP", // US Dollar ETF
  "Australian Stocks": "^AXJO", // ASX 200
  Bitcoin: "BTC-USD", // Bitcoin
  Ethereum: "ETH-USD", // Ethereum
};

const TYPING_SPEED = 15; // milliseconds per character (faster typing)

// Global cache for AI coach advice to prevent duplicate API calls across component instances
const aiAdviceCache = new Map<
  string,
  { data: CoachResponse; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global request lock to prevent duplicate API calls
const activeRequests = new Set<string>();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Maps coach personality to risk tolerance
 */
const getRiskTolerance = (personality: string): number => {
  const toleranceMap: Record<string, number> = {
    "Conservative Coach": 0.2,
    "Balanced Coach": 0.5,
    "Aggressive Coach": 0.8,
    "Income Coach": 0.3,
  };
  return toleranceMap[personality] || 0.5;
};

/**
 * Maps coach personality to investment goal
 */
const getInvestmentGoal = (
  personality: string
): "balanced" | "capital_gains" | "cash_flow" => {
  const goalMap: Record<string, "balanced" | "capital_gains" | "cash_flow"> = {
    "Conservative Coach": "capital_gains",
    "Balanced Coach": "balanced",
    "Aggressive Coach": "capital_gains",
    "Income Coach": "cash_flow",
  };
  return goalMap[personality] || "balanced";
};

/**
 * Extracts year from event title
 */
const extractEventYear = (eventTitle: string): number => {
  const yearMatch = eventTitle.match(/\d{4}/);
  return parseInt(yearMatch?.[0] || "1990");
};

/**
 * Formats percentage with sign
 */
const formatPercentage = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Determines player level based on mission difficulty, performance, and experience
 */
const getPlayerLevel = (
  eventTitle: string,
  actualReturn: number,
  performance: "profit" | "loss",
  selectedOption: string
): "beginner" | "intermediate" | "advanced" => {
  // Mission difficulty analysis based on event title
  const eventDifficulty = getEventDifficulty(eventTitle);

  // Investment option complexity
  const optionComplexity = getOptionComplexity(selectedOption);

  // Performance analysis
  const returnMagnitude = Math.abs(actualReturn);
  const isProfitable = performance === "profit";

  // Calculate difficulty score (0-100)
  let difficultyScore = 0;

  // Event difficulty weight: 40%
  difficultyScore += eventDifficulty * 0.4;

  // Option complexity weight: 30%
  difficultyScore += optionComplexity * 0.3;

  // Performance weight: 30%
  if (isProfitable) {
    difficultyScore += Math.min(returnMagnitude / 2, 30); // Cap at 30 points
  } else {
    difficultyScore += Math.min(returnMagnitude / 4, 15); // Losses get fewer points
  }

  // Determine level based on difficulty score
  if (difficultyScore >= 70) {
    return "advanced";
  } else if (difficultyScore >= 40) {
    return "intermediate";
  } else {
    return "beginner";
  }
};

/**
 * Analyzes event difficulty based on historical context
 */
const getEventDifficulty = (eventTitle: string): number => {
  const title = eventTitle.toLowerCase();

  // High difficulty events (complex market conditions)
  if (
    title.includes("bubble") ||
    title.includes("crisis") ||
    title.includes("crash")
  ) {
    return 90;
  }

  // Medium difficulty events (significant market movements)
  if (
    title.includes("recession") ||
    title.includes("inflation") ||
    title.includes("deflation")
  ) {
    return 70;
  }

  // Moderate difficulty events (market volatility)
  if (
    title.includes("volatility") ||
    title.includes("uncertainty") ||
    title.includes("change")
  ) {
    return 50;
  }

  // Lower difficulty events (stable conditions)
  if (
    title.includes("growth") ||
    title.includes("stability") ||
    title.includes("recovery")
  ) {
    return 30;
  }

  // Default difficulty
  return 40;
};

/**
 * Analyzes investment option complexity
 */
const getOptionComplexity = (selectedOption: string): number => {
  const option = selectedOption.toLowerCase();

  // High complexity options (cryptocurrency, derivatives)
  if (
    option.includes("bitcoin") ||
    option.includes("ethereum") ||
    option.includes("crypto")
  ) {
    return 90;
  }

  // Medium-high complexity (international markets, commodities)
  if (
    option.includes("japanese") ||
    option.includes("australian") ||
    option.includes("gold")
  ) {
    return 70;
  }

  // Medium complexity (bonds, real estate)
  if (
    option.includes("bonds") ||
    option.includes("real estate") ||
    option.includes("treasury")
  ) {
    return 50;
  }

  // Lower complexity (cash, stable assets)
  if (option.includes("cash") || option.includes("dollar")) {
    return 30;
  }

  // Default complexity
  return 50;
};

/**
 * Generates a cache key for AI coach advice
 */
const generateCacheKey = (
  coachName: string,
  selectedOption: string,
  eventTitle: string,
  actualReturn: number,
  finalAmount: number,
  performance: string
): string => {
  return `${coachName}-${selectedOption}-${eventTitle}-${actualReturn}-${finalAmount}-${performance}`;
};

/**
 * Checks if cached AI advice is still valid
 */
const getCachedAdvice = (cacheKey: string): CoachResponse | null => {
  const cached = aiAdviceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

/**
 * Checks if a request is already in progress for the given cache key
 */
const isRequestInProgress = (cacheKey: string): boolean => {
  return activeRequests.has(cacheKey);
};

/**
 * Marks a request as in progress
 */
const markRequestInProgress = (cacheKey: string): void => {
  activeRequests.add(cacheKey);
};

/**
 * Marks a request as completed
 */
const markRequestCompleted = (cacheKey: string): void => {
  activeRequests.delete(cacheKey);
};

/**
 * Stores AI advice in cache
 */
const cacheAdvice = (cacheKey: string, advice: CoachResponse): void => {
  aiAdviceCache.set(cacheKey, { data: advice, timestamp: Date.now() });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TeachingDialogue({
  coach,
  selectedOption,
  actualReturn,
  finalAmount,
  performance,
  outcome,
  event,
  simulationResult,
  onComplete,
}: TeachingDialogueProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [messages, setMessages] = useState<TeachingMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [realMetrics, setRealMetrics] = useState<InvestmentMetrics | null>(
    null
  );
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [aiCoachAdvice, setAiCoachAdvice] = useState<CoachResponse | null>(
    null
  );
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);
  // Use ref to track if we've already generated dialogue
  const hasGeneratedDialogue = useRef(false);
  // Track whether dialogue was generated with AI advice
  const [dialogueGeneratedWithAi, setDialogueGeneratedWithAi] = useState(false);
  // Track if we've already fetched AI advice to prevent duplicate API calls
  const hasFetchedAiAdvice = useRef(false);

  // Generate cache key for this mission - use useMemo to prevent recreation
  const cacheKey = React.useMemo(
    () =>
      generateCacheKey(
        coach.name,
        selectedOption.name,
        event.title,
        actualReturn,
        finalAmount,
        performance
      ),
    [
      coach.name,
      selectedOption.name,
      event.title,
      actualReturn,
      finalAmount,
      performance,
    ]
  );

  // ============================================================================
  // DIALOGUE GENERATION
  // ============================================================================

  // ============================================================================
  // DATA FETCHING EFFECTS
  // ============================================================================

  // Fetch real investment metrics
  useEffect(() => {
    const fetchRealMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const ticker = TICKER_MAP[selectedOption.name] || "^GSPC"; // Default to S&P 500
        const eventYear = extractEventYear(event.title);
        const metrics = await api.getHistoricalPerformance(ticker, eventYear);
        setRealMetrics(metrics);
      } catch (error) {
        console.error("Failed to fetch real metrics:", error);
        // Fall back to simulation data
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchRealMetrics();
  }, [selectedOption.name, event.title]);

  // Fetch AI coach advice
  useEffect(() => {
    // Check cache first
    const cachedAdvice = getCachedAdvice(cacheKey);
    if (cachedAdvice) {
      setAiCoachAdvice(cachedAdvice);
      hasFetchedAiAdvice.current = true;
      return;
    }

    // Check if request is already in progress globally
    if (isRequestInProgress(cacheKey)) {
      return;
    }

    // Prevent duplicate API calls within this component
    if (hasFetchedAiAdvice.current) {
      return;
    }

    const fetchAiCoachAdvice = async () => {
      markRequestInProgress(cacheKey); // Mark as in progress globally
      setLoadingAiAdvice(true);

      try {
        const coachRequest: CoachRequest = {
          player_level: getPlayerLevel(
            event.title,
            actualReturn,
            performance,
            selectedOption.name
          ),
          current_portfolio: { [selectedOption.name]: 1.0 }, // 100% in selected option
          investment_goal: getInvestmentGoal(coach.personality),
          risk_tolerance: getRiskTolerance(coach.personality),
          time_horizon: 365,
          completed_missions: ["Basic Investment", "Risk Management"],
          current_mission: event.title,
          player_context: `Player just completed an investment mission where they invested in ${
            selectedOption.name
          } during ${
            event.title
          }. The investment resulted in a ${performance} with ${actualReturn}% return, ending with $${Math.round(
            finalAmount
          ).toLocaleString()}. The player is working with ${coach.name} (${
            coach.personality
          }) who specialises in ${coach.description}.`,
        };

        const advice = await api.getCoachAdvice(coachRequest);
        setAiCoachAdvice(advice);
        hasFetchedAiAdvice.current = true; // Mark as fetched

        // Cache the advice for future use
        cacheAdvice(cacheKey, advice);
      } catch (error) {
        console.error("Failed to fetch AI coach advice:", error);
        hasFetchedAiAdvice.current = true; // Mark as fetched even on error
        // Fall back to static content
      } finally {
        setLoadingAiAdvice(false);
        markRequestCompleted(cacheKey); // Mark as completed globally
      }
    };

    fetchAiCoachAdvice();
  }, [cacheKey]); // Only depend on cacheKey changes

  // Generate simplified teaching dialogue function
  const generateDialogue = () => {
    const newMessages: TeachingMessage[] = [];
    const useAiAdvice = aiCoachAdvice && !loadingAiAdvice;

    // Only generate dialogue if we have AI advice
    if (!useAiAdvice) {
      return;
    }

    // Step 1: Greeting and result combined
    newMessages.push({
      id: "greeting",
      type: "greeting",
      content: aiCoachAdvice.advice,
      showContinue: true,
    });

    // Step 2: Show Portfolio Performance Chart with metrics
    newMessages.push({
      id: "portfolio_chart_explanation",
      type: "lesson",
      content: `**Now let's visualize your journey with the Portfolio Performance Chart.**\n\nThis chart shows how your investment value changed over time, helping you see the ups, downs, and overall trend of your investment journey.\n\n${aiCoachAdvice.recommendations
        .slice(0, 2)
        .map((rec) => `• ${rec}`)
        .join("\n")}`,
      showContinue: true,
      showMetrics: true, // Show metrics within Portfolio Performance Over Time
      showChart: true,
      showReturnsChart: false, // Don't show Annual Returns yet
      showAnalysis: false, // Don't show Risk Analysis yet
    });

    // Step 3: Show Annual Returns Chart with metrics
    newMessages.push({
      id: "returns_chart_explanation",
      type: "lesson",
      content: `**Let's examine your Annual Returns.**\n\nThis chart shows your year-by-year performance, helping you understand consistency and identify patterns in your investment returns.\n\nYour year-over-year performance shows ${aiCoachAdvice.risk_assessment.toLowerCase()}.`,
      showContinue: true,
      showMetrics: true, // Show metrics within Portfolio Performance Over Time
      showChart: false, // Hide Portfolio Performance Chart
      showReturnsChart: true, // Show Annual Returns Chart instead
      showAnalysis: false, // Don't show Risk Analysis yet
    });

    // Step 4: Show Risk Analysis with metrics
    newMessages.push({
      id: "risk_analysis_explanation",
      type: "lesson",
      content: `**Finally, let's analyze your Risk Profile.**\n\nRisk analysis helps you understand the trade-offs between potential returns and the volatility you experienced. This is crucial for future investment decisions.\n\nNow you have a complete picture of your investment performance.`,
      showContinue: true,
      showMetrics: true, // Show metrics within Portfolio Performance Over Time
      showChart: false, // Hide Portfolio Performance Chart
      showReturnsChart: false, // Hide Annual Returns Chart
      showAnalysis: true, // Show Risk Analysis instead
    });

    // Step 5: Key recommendations (No Portfolio Performance Over Time)
    newMessages.push({
      id: "recommendations",
      type: "lesson",
      content: `**My Key Recommendations:**\n\n${aiCoachAdvice.recommendations
        .map((rec) => `• ${rec}`)
        .join("\n")}`,
      showContinue: true,
      showMetrics: false, // Don't show Portfolio Performance Over Time
      showChart: false,
      showReturnsChart: false,
      showAnalysis: false,
    });

    // Step 6: Next steps (No Portfolio Performance Over Time)
    newMessages.push({
      id: "next_steps",
      type: "lesson",
      content: `**Next Steps:**\n\n${aiCoachAdvice.next_steps
        .map((step) => `• ${step}`)
        .join("\n")}`,
      showContinue: true,
      showMetrics: false, // Don't show Portfolio Performance Over Time
      showChart: false,
      showReturnsChart: false,
      showAnalysis: false,
    });

    // Step 7: Completion (No Portfolio Performance Over Time)
    newMessages.push({
      id: "completion",
      type: "completion",
      content: `🎉 ${aiCoachAdvice.encouragement} Ready for your next challenge?`,
      showComplete: true,
      showMetrics: false, // Don't show Portfolio Performance Over Time
      showChart: false,
      showReturnsChart: false,
      showAnalysis: false,
    });

    setMessages(newMessages);
    hasGeneratedDialogue.current = true; // Mark dialogue as generated
    setDialogueGeneratedWithAi(true); // Mark that dialogue was generated with AI advice
  };

  // Generate simplified teaching dialogue
  useEffect(() => {
    // Wait for AI advice to be fetched before generating dialogue
    if (loadingAiAdvice) {
      return; // Don't generate dialogue while loading
    }

    // Only generate dialogue if we have AI advice and haven't generated it yet
    if (aiCoachAdvice && !hasGeneratedDialogue.current) {
      generateDialogue();
    } else if (
      aiCoachAdvice &&
      hasGeneratedDialogue.current &&
      !dialogueGeneratedWithAi
    ) {
      // Regenerate dialogue with AI advice if it wasn't generated with it before
      hasGeneratedDialogue.current = false;
      generateDialogue();
    } else if (
      aiCoachAdvice &&
      hasGeneratedDialogue.current &&
      dialogueGeneratedWithAi
    ) {
      // AI advice available and dialogue already generated with AI advice
    } else {
      // Waiting for AI advice
    }
  }, [
    // Only depend on loadingAiAdvice and aiCoachAdvice
    loadingAiAdvice,
    aiCoachAdvice,
  ]);

  // Track component mount
  useEffect(() => {
    // Clean up old cache entries
    const now = Date.now();
    for (const [key, value] of aiAdviceCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        aiAdviceCache.delete(key);
      }
    }

    return () => {
      // Component unmounting
    };
  }, []);

  // ============================================================================
  // TYPING ANIMATION
  // ============================================================================

  // Typing effect
  useEffect(() => {
    if (messages.length === 0) return;

    const currentMessage = messages[currentMessageIndex];
    if (!currentMessage) return;

    setIsTyping(true);
    setShowContinue(false);
    setDisplayedText("");

    let currentIndex = 0;
    const text = currentMessage.content;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, TYPING_SPEED);
      } else {
        setIsTyping(false);
        setShowContinue(true);
      }
    };

    typeNextChar();
  }, [currentMessageIndex, messages]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleContinue = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMetricsCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number,
    colorClass?: string
  ) => (
    <Card className="text-center p-4">
      <div className="flex flex-col items-center gap-2">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-xl font-bold ${colorClass || ""}`}>
            {loadingMetrics ? "Loading..." : value}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderMarkdownComponents = {
    p: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-blue-800" {...props}>
        {children}
      </strong>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-1 mt-2" {...props}>
        {children}
      </ul>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-700" {...props}>
        {children}
      </li>
    ),
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state while fetching AI advice
  if (loadingAiAdvice && messages.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* Coach Header */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="relative w-12 h-12 shrink-0">
            <Image
              src={coach.animatedAvatar}
              alt={coach.name}
              fill
              sizes="48px"
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{coach.name}</h3>
              <Badge variant="secondary" className={coach.color}>
                {coach.personality}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{coach.description}</p>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-gray-700">
              <p className="font-medium text-lg">
                Getting personalized advice from {coach.name}...
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Analyzing your investment decision and preparing insights
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMessage = messages[currentMessageIndex];
  if (!currentMessage) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Coach Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="relative w-12 h-12 shrink-0">
          <Image
            src={
              isTyping || !showContinue ? coach.animatedAvatar : coach.avatar
            }
            alt={coach.name}
            fill
            sizes="48px"
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{coach.name}</h3>
            <Badge variant="secondary" className={coach.color}>
              {coach.personality}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{coach.description}</p>
        </div>
      </div>

      {/* Dialogue Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="text-gray-800 text-lg leading-relaxed prose prose-sm max-w-none">
          <ReactMarkdown components={renderMarkdownComponents}>
            {displayedText}
          </ReactMarkdown>
          {isTyping && (
            <span className="inline-block w-2 h-6 bg-blue-500 ml-1 animate-pulse"></span>
          )}
        </div>
      </div>

      {/* Key Metrics Display - REMOVED, now handled by PerformanceChart */}
      {/* Performance Chart - Show progressively */}
      {(currentMessage.showChart ||
        currentMessage.showReturnsChart ||
        currentMessage.showAnalysis) && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">
            Portfolio Performance Over Time
          </h4>
          <Card className="p-4">
            <PerformanceChart
              data={
                realMetrics?.chart_data?.map((item) => ({
                  date: item.date,
                  value: item.portfolio_value,
                })) ||
                simulationResult?.performance_chart?.dates?.map(
                  (date: string, index: number) => ({
                    date: date,
                    value: simulationResult.performance_chart.values[index],
                  })
                ) ||
                []
              }
              initialValue={100000}
              finalValue={realMetrics?.final_value || finalAmount}
              totalReturn={realMetrics?.total_return || actualReturn}
              volatility={realMetrics ? realMetrics.volatility / 100 : 0.1626}
              sharpeRatio={realMetrics ? realMetrics.sharpe_ratio : 0.1}
              maxDrawdown={
                realMetrics ? realMetrics.max_drawdown / 100 : -0.1956
              }
              showMetrics={currentMessage.showMetrics} // Now show metrics here
              showPortfolioChart={currentMessage.showChart}
              showReturnsChart={currentMessage.showReturnsChart}
              showRiskAnalysis={currentMessage.showAnalysis}
            />
          </Card>
        </div>
      )}

      {/* Risk Analysis - REMOVED to avoid duplication with PerformanceChart */}
      {/* Action Buttons */}
      <div className="flex justify-end">
        {currentMessage.showComplete ? (
          <Button
            onClick={handleComplete}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={isTyping}
          >
            <Trophy className="h-4 w-4" />
            Complete Mission
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            className="flex items-center gap-2"
            disabled={isTyping || !showContinue}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-6">
        <div className="text-center">
          <div className="flex gap-2 mb-2">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentMessageIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentMessageIndex + 1} of {messages.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {currentMessage.showChart &&
              !currentMessage.showReturnsChart &&
              !currentMessage.showAnalysis &&
              "Explaining Portfolio Performance Chart"}
            {currentMessage.showReturnsChart &&
              !currentMessage.showAnalysis &&
              "Explaining Annual Returns Chart"}
            {currentMessage.showAnalysis && "Explaining Risk Analysis"}
          </p>
        </div>
      </div>
    </div>
  );
}
