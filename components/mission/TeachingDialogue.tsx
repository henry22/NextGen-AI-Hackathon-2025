"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { api, InvestmentMetrics } from "@/lib/api";

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
  const [messages, setMessages] = useState<TeachingMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [realMetrics, setRealMetrics] = useState<InvestmentMetrics | null>(
    null
  );
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Fetch real investment metrics
  useEffect(() => {
    const fetchRealMetrics = async () => {
      setLoadingMetrics(true);
      try {
        // Map investment options to real tickers
        const tickerMap: Record<string, string> = {
          "Japanese Stocks": "^N225", // Nikkei 225
          "Tokyo Real Estate": "^N225", // Using Nikkei as proxy
          "US Treasury Bonds": "^TNX", // 10-year Treasury yield
          Gold: "GLD", // Gold ETF
          "US Dollar Cash": "UUP", // US Dollar ETF
          "Australian Stocks": "^AXJO", // ASX 200
          Bitcoin: "BTC-USD", // Bitcoin
          Ethereum: "ETH-USD", // Ethereum
        };

        const ticker = tickerMap[selectedOption.name] || "^GSPC"; // Default to S&P 500

        // Get event year from event title
        const eventYear = parseInt(event.title.match(/\d{4}/)?.[0] || "1990");

        // Fetch historical performance for the event period
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

  // Generate comprehensive teaching dialogue
  useEffect(() => {
    const generateDialogue = () => {
      const newMessages: TeachingMessage[] = [];

      // Greeting
      newMessages.push({
        id: "greeting",
        type: "greeting",
        content: `Hey there, young investor! Let's review your ${selectedOption.name} investment together. I'll walk you through what happened and what we can learn from it.`,
        showContinue: true,
      });

      // Result reveal
      newMessages.push({
        id: "result",
        type: "result",
        content:
          (realMetrics?.total_return || actualReturn) > 0
            ? `Great news! Your ${selectedOption.name} investment earned you ${
                realMetrics?.total_return?.toFixed(2) || actualReturn
              }% return. You turned $100,000 into $${
                realMetrics?.final_value?.toLocaleString() ||
                finalAmount.toLocaleString()
              }. That's solid performance!`
            : `Your ${selectedOption.name} investment resulted in a ${
                realMetrics?.total_return?.toFixed(2) || actualReturn
              }% loss, reducing your $100,000 to $${
                realMetrics?.final_value?.toLocaleString() ||
                finalAmount.toLocaleString()
              }. But don't worry - every investor learns from losses!`,
        showContinue: true,
      });

      // Key metrics explanation
      newMessages.push({
        id: "metrics",
        type: "metrics",
        content: `Let me show you some key metrics that help us understand your investment performance. These numbers tell us the story of your investment journey.`,
        showContinue: true,
        showMetrics: true,
      });

      // Chart explanation
      newMessages.push({
        id: "chart",
        type: "chart",
        content: `Now, let's look at your portfolio performance over time. This chart shows how your investment value changed throughout the period. See those ups and downs? That's normal in investing!`,
        showContinue: true,
        showChart: true,
      });

      // Risk analysis
      newMessages.push({
        id: "analysis",
        type: "analysis",
        content: `Finally, let's talk about risk. Every investment has risk, and understanding it helps you make better decisions. Let me explain what these risk metrics mean for you.`,
        showContinue: true,
        showAnalysis: true,
      });

      // Educational lesson
      newMessages.push({
        id: "lesson",
        type: "lesson",
        content:
          performance === "profit"
            ? `The ${event.title} taught us that ${
                performance === "profit"
                  ? "sometimes the safest choice pays off"
                  : "even the best plans can face challenges"
              }. Remember: diversification and patience are your best friends in investing.`
            : `The ${event.title} showed us that markets can be unpredictable. This teaches us the importance of research, diversification, and not putting all our eggs in one basket.`,
        showContinue: true,
      });

      // Completion
      newMessages.push({
        id: "completion",
        type: "completion",
        content: `Excellent work! You've earned 150 XP and learned valuable investment lessons. Keep practicing, and you'll become a confident investor. Ready for your next challenge?`,
        showComplete: true,
      });

      setMessages(newMessages);
    };

    generateDialogue();
  }, [
    coach,
    selectedOption,
    actualReturn,
    finalAmount,
    performance,
    outcome,
    event,
    realMetrics, // Add realMetrics as dependency
  ]);

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
    const typingSpeed = 30; // milliseconds per character

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        setIsTyping(false);
        setShowContinue(true);
      }
    };

    typeNextChar();
  }, [currentMessageIndex, messages]);

  const handleContinue = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const currentMessage = messages[currentMessageIndex];
  if (!currentMessage) return null;

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
        <p className="text-gray-800 text-lg leading-relaxed">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-2 h-6 bg-blue-500 ml-1 animate-pulse"></span>
          )}
        </p>
      </div>

      {/* Key Metrics Display */}
      {currentMessage.showMetrics && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">
            Key Investment Metrics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Final Value</p>
                  <p className="text-xl font-bold">
                    $
                    {loadingMetrics
                      ? "Loading..."
                      : realMetrics
                      ? realMetrics.final_value.toLocaleString()
                      : finalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Return</p>
                  <p
                    className={`text-xl font-bold ${
                      (realMetrics?.total_return || actualReturn) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(realMetrics?.total_return || actualReturn) > 0 ? "+" : ""}
                    {loadingMetrics
                      ? "Loading..."
                      : realMetrics && realMetrics.total_return !== undefined
                      ? realMetrics.total_return.toFixed(2)
                      : actualReturn}
                    %
                  </p>
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Volatility</p>
                  <p className="text-xl font-bold">
                    {loadingMetrics
                      ? "Loading..."
                      : realMetrics
                      ? `${realMetrics.volatility.toFixed(2)}%`
                      : "16.26%"}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  <p className="text-xl font-bold">
                    {loadingMetrics
                      ? "Loading..."
                      : realMetrics
                      ? realMetrics.sharpe_ratio.toFixed(2)
                      : "0.10"}
                  </p>
                </div>
              </div>
            </Card>
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
