"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
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
  type:
    | "greeting"
    | "result"
    | "metrics"
    | "chart"
    | "analysis"
    | "lesson"
    | "completion";
  content: string;
  showContinue?: boolean;
  showComplete?: boolean;
  showMetrics?: boolean;
  showChart?: boolean;
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

const TYPING_SPEED = 30; // milliseconds per character

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
 * Formats currency value
 */
const formatCurrency = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Formats percentage with sign
 */
const formatPercentage = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
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
    const fetchAiCoachAdvice = async () => {
      setLoadingAiAdvice(true);
      try {
        const coachRequest: CoachRequest = {
          player_level: "beginner",
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
          }. The investment resulted in a ${performance} with ${actualReturn}% return, ending with $${formatCurrency(
            finalAmount
          )}. The player is working with ${coach.name} (${
            coach.personality
          }) who specialises in ${coach.description}.`,
        };

        const advice = await api.getCoachAdvice(coachRequest);
        setAiCoachAdvice(advice);
      } catch (error) {
        console.error("Failed to fetch AI coach advice:", error);
        // Fall back to static content
      } finally {
        setLoadingAiAdvice(false);
      }
    };

    fetchAiCoachAdvice();
  }, [
    selectedOption.name,
    event.title,
    actualReturn,
    finalAmount,
    performance,
    coach.name,
    coach.personality,
  ]);

  // ============================================================================
  // DIALOGUE GENERATION
  // ============================================================================

  // Generate simplified teaching dialogue
  useEffect(() => {
    if (loadingAiAdvice || hasGeneratedDialogue.current) {
      return; // Don't generate dialogue while loading or if already generated
    }

    const generateDialogue = () => {
      const newMessages: TeachingMessage[] = [];
      const useAiAdvice = aiCoachAdvice && !loadingAiAdvice;

      // Greeting and result combined
      newMessages.push({
        id: "greeting",
        type: "greeting",
        content: useAiAdvice
          ? aiCoachAdvice.advice
          : `Hey there! Your ${
              selectedOption.name
            } investment resulted in a ${performance} with ${actualReturn}% return, ending with $${formatCurrency(
              finalAmount
            )}.`,
        showContinue: true,
      });

      // Key insights
      newMessages.push({
        id: "insights",
        type: "metrics",
        content:
          useAiAdvice && aiCoachAdvice.educational_insights.length > 0
            ? `**Key Insights:**\n${aiCoachAdvice.educational_insights
                .map((insight) => `• ${insight}`)
                .join("\n")}`
            : `Your investment shows how markets can be unpredictable. The key is to learn from every experience!`,
        showContinue: true,
        showMetrics: true,
      });

      // Chart explanation
      newMessages.push({
        id: "chart",
        type: "chart",
        content:
          useAiAdvice && aiCoachAdvice.recommendations.length > 0
            ? `**Chart Analysis:**\n${aiCoachAdvice.recommendations
                .slice(0, 2)
                .map((rec) => `• ${rec}`)
                .join("\n")}`
            : `This chart shows your investment journey. The trend is what matters most!`,
        showContinue: true,
        showChart: true,
      });

      // Recommendations
      newMessages.push({
        id: "recommendations",
        type: "lesson",
        content:
          useAiAdvice && aiCoachAdvice.recommendations.length > 0
            ? `**My Recommendations:**\n${aiCoachAdvice.recommendations
                .map((rec) => `• ${rec}`)
                .join("\n")}`
            : `Remember: diversify your investments and think long-term!`,
        showContinue: true,
      });

      // Next steps
      newMessages.push({
        id: "next_steps",
        type: "lesson",
        content:
          useAiAdvice && aiCoachAdvice.next_steps.length > 0
            ? `**Next Steps:**\n${aiCoachAdvice.next_steps
                .map((step) => `• ${step}`)
                .join("\n")}`
            : `Keep learning and practicing! Every expert started where you are now.`,
        showContinue: true,
      });

      // Completion
      newMessages.push({
        id: "completion",
        type: "completion",
        content: useAiAdvice
          ? `🎉 ${aiCoachAdvice.encouragement} Ready for your next challenge?`
          : `🎉 Congratulations! You've completed this investment mission. Ready for your next challenge?`,
        showComplete: true,
      });

      setMessages(newMessages);
      hasGeneratedDialogue.current = true; // Mark dialogue as generated
    };

    generateDialogue();
  }, [
    coach.name,
    coach.personality,
    selectedOption,
    actualReturn,
    finalAmount,
    performance,
    outcome,
    event,
    realMetrics,
    loadingAiAdvice,
  ]);

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

  const currentMessage = messages[currentMessageIndex];
  if (!currentMessage) return null;

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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Coach Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="text-3xl">{coach.avatar}</div>
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

      {/* Key Metrics Display */}
      {currentMessage.showMetrics && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">
            Key Investment Metrics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderMetricsCard(
              <DollarSign className="h-6 w-6 text-green-600" />,
              "Final Value",
              `$${
                loadingMetrics
                  ? "Loading..."
                  : realMetrics
                  ? formatCurrency(realMetrics.final_value)
                  : formatCurrency(finalAmount)
              }`
            )}
            {renderMetricsCard(
              <TrendingUp className="h-6 w-6 text-green-600" />,
              "Total Return",
              formatPercentage(realMetrics?.total_return || actualReturn),
              (realMetrics?.total_return || actualReturn) > 0
                ? "text-green-600"
                : "text-red-600"
            )}
            {renderMetricsCard(
              <BarChart3 className="h-6 w-6 text-blue-600" />,
              "Volatility",
              loadingMetrics
                ? "Loading..."
                : realMetrics
                ? `${realMetrics.volatility.toFixed(2)}%`
                : "16.26%"
            )}
            {renderMetricsCard(
              <Shield className="h-6 w-6 text-purple-600" />,
              "Sharpe Ratio",
              loadingMetrics
                ? "Loading..."
                : realMetrics
                ? realMetrics.sharpe_ratio.toFixed(2)
                : "0.10"
            )}
          </div>
        </div>
      )}

      {/* Performance Chart */}
      {currentMessage.showChart && (
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
              sharpeRatio={realMetrics?.sharpe_ratio || 0.1}
              maxDrawdown={
                realMetrics ? realMetrics.max_drawdown / 100 : -0.1956
              }
            />
          </Card>
        </div>
      )}

      {/* Risk Analysis */}
      {currentMessage.showAnalysis && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">
            Risk Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h5 className="font-medium mb-2">Maximum Drawdown</h5>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg inline-block">
                <span className="font-bold">
                  {loadingMetrics
                    ? "Loading..."
                    : realMetrics
                    ? `${realMetrics.max_drawdown.toFixed(2)}%`
                    : "-19.56%"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Largest peak-to-trough decline during the period
              </p>
            </Card>
            <Card className="p-4">
              <h5 className="font-medium mb-2">Risk-Adjusted Return</h5>
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg inline-block">
                <span className="font-bold">
                  {loadingMetrics
                    ? "Loading..."
                    : realMetrics
                    ? realMetrics.sharpe_ratio.toFixed(2)
                    : "0.10"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Return per unit of risk (Sharpe Ratio)
              </p>
            </Card>
          </div>
        </div>
      )}

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
        <div className="flex gap-2">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentMessageIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
