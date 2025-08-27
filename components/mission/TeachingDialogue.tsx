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
import ReactMarkdown from "react-markdown";

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
    | "metrics_detail"
    | "chart"
    | "chart_reading"
    | "analysis"
    | "risk_detail"
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

      // Financial terms introduction
      newMessages.push({
        id: "terms_intro",
        type: "metrics",
        content: `Before we look at your results, let me teach you some important financial terms that every young investor should know. These might sound complicated, but I'll explain them in simple language!`,
        showContinue: true,
        showMetrics: true,
      });

      // Key metrics explanation - Enhanced educational content
      newMessages.push({
        id: "metrics",
        type: "metrics",
        content: `Now let's look at your investment report card! These numbers tell us exactly how well your $100,000 performed during this investment period. Each number has a special meaning that helps us understand your investment journey.`,
        showContinue: true,
        showMetrics: true,
      });

      // Detailed metrics explanation - Enhanced for young learners
      newMessages.push({
        id: "metrics_detail",
        type: "metrics_detail",
        content: `Let me explain these financial terms in simple language that you'll understand:

• **Final Value**: 
  This is exactly how much money you have at the end of your investment period. If you started with $100,000 and now you have $61,604, that's your Final Value. It's like checking your bank account balance after a year of investing!

• **Total Return**: 
  This percentage tells you if you made money or lost money overall. If it's positive (like +5%), you made money. If it's negative (like -38.40%), you lost money. Think of it as your investment's report card grade - A+ for big gains, F for losses!

• **Volatility**: 
  This measures how much your investment value jumped up and down during the period. High volatility (like 32.82%) means your money went on a wild roller coaster ride - lots of ups and downs! Low volatility means a smooth, gentle boat ride. Think of it as how "bumpy" your investment journey was.

• **Sharpe Ratio**: 
  This is like a "bang for your buck" score. It tells you if the risk you took was worth the reward you got. A positive number means you got good returns for the risk. A negative number (like -1.41) means the risk wasn't worth it. It's like asking "Was this roller coaster worth the scary parts?"`,
        showContinue: true,
        showMetrics: true,
      });

      // Chart explanation - Enhanced educational content
      newMessages.push({
        id: "chart",
        type: "chart",
        content: `Now let's look at your investment journey over time! This chart is like a storybook of your money's adventure. The line shows how your $100,000 grew (or shrank) day by day.`,
        showContinue: true,
        showChart: true,
      });

      // Chart reading lesson - Enhanced for young learners
      newMessages.push({
        id: "chart_reading",
        type: "chart_reading",
        content: `Now let me teach you how to read these charts like a financial expert! These charts are like storybooks of your money's adventure:

**Portfolio Performance (Annual) Chart:**
This chart shows how your $100,000 changed over time, year by year. Think of it as a timeline of your money's journey!

• **Upward slope**: When the line goes up, your money is growing! The steeper the line, the faster your money is multiplying. It's like watching your savings grow!

• **Downward slope**: When the line goes down, your investment value is decreasing. Don't panic - this is completely normal! Even the best investments have bad days.

• **Flat line**: When the line is horizontal, your investment is stable - not growing much, but not losing much either. It's like parking your money safely.

• **Bumps and dips**: These small ups and downs show daily market movements. Markets are like the weather - sometimes sunny (up), sometimes rainy (down)!

**Annual Returns Chart:**
This chart shows the percentage return for each year. It's like a year-by-year report card of your investment performance!

• **Positive bars**: Good years when your investment made money
• **Negative bars**: Tough years when your investment lost money
• **The trend**: Look at the overall pattern - are there more good years than bad years?

**Key Lesson**: The overall trend is what matters most, not the daily ups and downs. Think long-term!`,
        showContinue: true,
        showChart: true,
      });

      // Risk analysis - Enhanced educational content
      newMessages.push({
        id: "analysis",
        type: "analysis",
        content: `Now let's talk about risk - this is super important for young investors! Risk isn't always bad - it's like the price we pay for the chance to grow our money. Let me explain these risk metrics.`,
        showContinue: true,
        showAnalysis: true,
      });

      // Risk metrics explanation - Enhanced for young learners
      newMessages.push({
        id: "risk_detail",
        type: "risk_detail",
        content: `Now let me explain these risk terms in simple language that makes sense:

**Maximum Drawdown:**
This is the biggest drop your investment ever experienced from its highest point. Think of it like the deepest dip on a roller coaster ride!

• **What it means**: If your investment was worth $100,000 at its peak, but dropped to $52,240 at its lowest point, that's a -47.76% drawdown.
• **Real example**: It's like if you had $100 in your pocket, but at some point you only had $52.24 left - that's scary!
• **Why it matters**: This tells you the worst-case scenario you experienced. It helps you understand how much risk you can handle.

**Risk-Adjusted Return - Sharpe Ratio:**
This is like a "bang for your buck" score for your investment. It tells you if the risk you took was worth the reward you got.

• **What it means**: A positive number (like +1.0) means you got good returns for the risk you took. A negative number (like -1.41) means the risk wasn't worth it.
• **Real example**: It's like asking "Was this roller coaster worth the scary parts?" If you got a great view and fun experience, maybe it was worth it. If you just got scared and sick, maybe not!
• **Why it matters**: This helps you choose investments that give you the best reward for the risk you're willing to take.

**Key Lesson**: Understanding these risk numbers helps you make smarter investment choices and avoid investments that are too risky for you!`,
        showContinue: true,
        showAnalysis: true,
      });

      // Investment strategy lesson - Personalized by coach type
      newMessages.push({
        id: "strategy",
        type: "lesson",
        content:
          coach.personality === "Conservative Coach"
            ? `As your conservative coach, I want to emphasize the importance of steady, reliable investing! Here are my top lessons:

• **Safety First**: Start with stable investments like bonds and blue-chip stocks. Think of it like building a house - you need a solid foundation first!

• **Diversification**: Don't put all your money in one place. Spread it across different types of investments - like having different players on your team!

• **Time in the market**: The longer you stay invested, the better your chances of success. Think of it like planting a tree - it takes time to grow!

• **Research first**: Always understand what you're investing in before you put your money down. Knowledge is your best investment tool!`
            : coach.personality === "Growth Coach"
            ? `As your growth coach, I want to show you how to maximize your investment potential! Here are my key strategies:

• **Growth Opportunities**: Look for investments with strong growth potential, but always balance with some safer options too!

• **Diversification**: Don't put all your money in one place. Spread it across different types of investments - like having different players on your team!

• **Time in the market**: The longer you stay invested, the better your chances of success. Think of it like planting a tree - it takes time to grow!

• **Research first**: Always understand what you're investing in before you put your money down. Knowledge is your best investment tool!`
            : `Now let's talk about what this teaches us about smart investing! Here are some key lessons every young investor should remember:

• **Diversification**: Don't put all your money in one place. Spread it across different types of investments - like having different players on your team!

• **Time in the market**: The longer you stay invested, the better your chances of success. Think of it like planting a tree - it takes time to grow!

• **Risk vs Reward**: Higher potential returns usually come with higher risk. It's like choosing between a safe bike ride or an exciting roller coaster.

• **Research first**: Always understand what you're investing in before you put your money down. Knowledge is your best investment tool!`,
        showContinue: true,
      });

      // Practical tips
      newMessages.push({
        id: "tips",
        type: "lesson",
        content: `Here are some practical tips for young investors like you:

• **Start small**: You don't need thousands to begin investing. Many platforms let you start with just $10!

• **Set goals**: Know what you're saving for - a car, university, or your first home. Goals help you stay focused.

• **Emergency fund first**: Before investing, save 3-6 months of expenses in a savings account. This is your safety net!

• **Learn continuously**: Read about investing, follow financial news, and practice with games like this one.

• **Don't panic**: Markets go up and down. Stay calm and stick to your plan!`,
        showContinue: true,
      });

      // Financial knowledge summary
      newMessages.push({
        id: "knowledge_summary",
        type: "lesson",
        content: `🎓 Let's review all the financial terms you learned today! You're now a financial expert:

**Investment Metrics:**
✅ **Final Value**: How much money you have at the end
✅ **Total Return**: Your profit or loss percentage
✅ **Volatility**: How bumpy your investment ride was
✅ **Sharpe Ratio**: Whether the risk was worth the reward

**Charts:**
✅ **Portfolio Performance (Annual)**: Your money's journey over time
✅ **Annual Returns**: Year-by-year performance report card
✅ **Upward/Downward slopes**: How to read investment trends
✅ **Bumps and dips**: Understanding market movements

**Risk Analysis:**
✅ **Maximum Drawdown**: The biggest drop you experienced
✅ **Risk-Adjusted Return**: Reward vs risk score

You now speak the language of finance! 🎉`,
        showContinue: true,
      });

      // Summary and completion
      newMessages.push({
        id: "summary",
        type: "lesson",
        content: `Let's recap what we learned today! You now understand:

✅ **Investment Metrics**: How to read your investment report card
✅ **Charts**: How to track your money's journey over time  
✅ **Risk Analysis**: How to understand the ups and downs of investing
✅ **Smart Strategies**: How to make better investment decisions
✅ **Practical Tips**: How to start your real investment journey

You're well on your way to becoming a confident young investor!`,
        showContinue: true,
      });

      // Completion
      newMessages.push({
        id: "completion",
        type: "completion",
        content: `🎉 Congratulations! You've earned 150 XP and completed this investment mission. You now have the knowledge to make smart financial decisions. Remember: every expert investor started exactly where you are now. Keep learning, keep practicing, and your financial future will be bright! Ready for your next challenge?`,
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
        <div className="text-gray-800 text-lg leading-relaxed prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <span>{children}</span>,
              strong: ({ children }) => (
                <strong className="font-bold text-blue-800">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
            }}
          >
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
