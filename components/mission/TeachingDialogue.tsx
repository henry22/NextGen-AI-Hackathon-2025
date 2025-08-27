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
          performance === "profit"
            ? `Great news! Your ${
                selectedOption.name
              } investment earned you ${actualReturn}% return. You turned $100,000 into $${finalAmount.toLocaleString()}. That's solid performance!`
            : `Your ${
                selectedOption.name
              } investment resulted in a ${actualReturn}% loss, reducing your $100,000 to $${finalAmount.toLocaleString()}. But don't worry - every investor learns from losses!`,
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
                    ${finalAmount.toLocaleString()}
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
                      performance === "profit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {actualReturn > 0 ? "+" : ""}
                    {actualReturn}%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Volatility</p>
                  <p className="text-xl font-bold">16.26%</p>
                </div>
              </div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  <p className="text-xl font-bold">0.10</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      {currentMessage.showChart && simulationResult && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">
            Portfolio Performance Over Time
          </h4>
          <Card className="p-4">
            <PerformanceChart
              data={simulationResult.performance_chart || []}
              initialValue={100000}
              finalValue={finalAmount}
              totalReturn={actualReturn}
              volatility={0.1626}
              sharpeRatio={0.1}
              maxDrawdown={-0.1956}
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
                <span className="font-bold">-19.56%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Largest peak-to-trough decline during the period
              </p>
            </Card>
            <Card className="p-4">
              <h5 className="font-medium mb-2">Risk-Adjusted Return</h5>
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg inline-block">
                <span className="font-bold">0.10</span>
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
