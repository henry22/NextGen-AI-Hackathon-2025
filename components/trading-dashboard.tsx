"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Minus,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import CoachChat from "@/components/CoachChat/CoachChat";

interface Portfolio {
  [key: string]: {
    shares: number;
    avgPrice: number;
    currentPrice: number;
    dailyChange: number;
  };
}

interface AICoach {
  id: string;
  name: string;
  avatar: string;
  style: string;
  gif?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  message: string;
  timestamp: Date;
}

interface TradingDashboardProps {
  initialPortfolio: Record<string, number>;
  selectedCoach: AICoach;
  onEndCompetition: (data: any) => void;
  startingCapital?: number;
}

// Mock market data for simulation
const marketData = {
  apple: { price: 230.45, change: 2.3 },
  microsoft: { price: 506.46, change: 1.8 },
  nvidia: { price: 178.10, change: 4.2 },
  tesla: { price: 346.76, change: -1.5 },
  sp500: { price: 646.33, change: 1.2 },
  etf: { price: 134.18, change: 0.8 },
  bitcoin: { price: 43250.0, change: 3.7 },
  ethereum: { price: 2680.5, change: 2.1 },
};

const investmentNames = {
  apple: "Apple Inc.",
  microsoft: "Microsoft Corp.",
  nvidia: "NVIDIA Corp.",
  tesla: "Tesla Inc.",
  sp500: "S&P 500 ETF",
  etf: "Global ETF",
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
};

export default function TradingDashboard({
  initialPortfolio,
  selectedCoach,
  onEndCompetition,
  startingCapital = 5000,
}: TradingDashboardProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [cash, setCash] = useState(0);
  const [totalValue, setTotalValue] = useState(startingCapital);
  const [dailyReturn, setDailyReturn] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [day, setDay] = useState(1);

  // 资产当前价格
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.keys(marketData).map((k) => [
        k,
        marketData[k as keyof typeof marketData].price,
      ])
    )
  );

  // 图表点：time（小时），total（总资产），以及每个资产的价格
  type PerfPoint = { time: number; total: number } & Record<string, number>;

  const [performanceData, setPerformanceData] = useState<PerfPoint[]>([
    {
      time: 0,
      total: startingCapital,
      ...Object.fromEntries(
        Object.keys(marketData).map((k) => [
          k,
          marketData[k as keyof typeof marketData].price,
        ])
      ),
    },
  ]);

  const hourRef = useRef(0); // 当前小时（0~24）
  const runningRef = useRef(true); // 是否在运行
  const cashRef = useRef(cash); // 用于 interval 内读取最新 cash
  const portfolioRef = useRef(portfolio); // 用于 interval 内读取最新 portfolio

  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);
  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  // mock performance data
  useEffect(() => {
    const interval = setInterval(() => {
      // 先做停止判断（确保价格与图表都不再推进）
      const nextHour = hourRef.current + 1;
      if (nextHour > 24 || !runningRef.current) {
        runningRef.current = false;
        clearInterval(interval);
        return;
      }

      // 1) 先生成下一刻价格
      let nextPrices: Record<string, number> = {};
      setPrices((prev) => {
        const next: Record<string, number> = { ...prev };
        Object.keys(prev).forEach((asset) => {
          const rf = 1 + (Math.random() * 0.1 - 0.05); // ±5%
          next[asset] = Math.max(0, next[asset] * rf);
        });
        nextPrices = next;
        return next;
      });

      // 2) 计算新总资产并推进图表
      let portfolioValue = 0;
      Object.entries(portfolioRef.current).forEach(([asset, holding]) => {
        const p =
          nextPrices[asset] ??
          marketData[asset as keyof typeof marketData].price;
        portfolioValue += holding.shares * p;
      });
      const newTotal = portfolioValue + cashRef.current;

      setPerformanceData((prev) => [
        ...prev,
        { time: nextHour, total: newTotal, ...nextPrices },
      ]);

      // 3) 同步持仓价格
      setPortfolio((prev) => {
        const updated: Portfolio = { ...prev };
        Object.keys(updated).forEach((asset) => {
          if (updated[asset]) {
            updated[asset].currentPrice =
              nextPrices[asset] ?? updated[asset].currentPrice;
          }
        });
        return updated;
      });

      // 4) 最后再推进小时计数
      hourRef.current = nextHour;
    }, 3000); // 3s = 1小时（你注释写 5s，可按需统一）

    return () => clearInterval(interval);
  }, []);

  const hourlyTicks = useMemo(() => {
    if (performanceData.length === 0) return [0];
    const maxHour = performanceData[performanceData.length - 1].time;
    const ticks: number[] = [];
    for (let h = 0; h <= maxHour; h++) {
      ticks.push(h);
    }
    return ticks;
  }, [performanceData]);

  // Initialize portfolio from allocations
  useEffect(() => {
    const initialCash =
      startingCapital -
      Object.values(initialPortfolio).reduce((sum, val) => sum + val, 0);
    setCash(initialCash);

    const newPortfolio: Portfolio = {};
    Object.entries(initialPortfolio).forEach(([asset, allocation]) => {
      if (allocation > 0) {
        const currentPrice = marketData[asset as keyof typeof marketData].price;
        const shares = allocation / currentPrice;
        newPortfolio[asset] = {
          shares,
          avgPrice: currentPrice,
          currentPrice,
          dailyChange: marketData[asset as keyof typeof marketData].change,
        };
      }
    });
    setPortfolio(newPortfolio);

    // Initial AI greeting
    setChatMessages([
      {
        id: "1",
        sender: "ai",
        message: `Hello! I'm ${selectedCoach.name}, your AI investment coach. I'll provide investment advice based on market conditions. Let's start this investment competition!`,
        timestamp: new Date(),
      },
    ]);
  }, [initialPortfolio, selectedCoach]);

  // Calculate total portfolio value
  useEffect(() => {
    const portfolioValue = Object.values(portfolio).reduce((sum, holding) => {
      return sum + holding.shares * holding.currentPrice;
    }, 0);
    const newTotalValue = portfolioValue + cash;
    setTotalValue(newTotalValue);
    setDailyReturn(((newTotalValue - startingCapital) / startingCapital) * 100);
  }, [portfolio, cash]);

  const handleBuy = (asset: string, amount: number) => {
    const currentPrice = marketData[asset as keyof typeof marketData].price;
    const cost = amount * currentPrice;

    if (cost <= cash) {
      setCash((prev) => prev - cost);
      setPortfolio((prev) => ({
        ...prev,
        [asset]: prev[asset]
          ? {
              ...prev[asset],
              shares: prev[asset].shares + amount,
              avgPrice:
                (prev[asset].shares * prev[asset].avgPrice + cost) /
                (prev[asset].shares + amount),
            }
          : {
              shares: amount,
              avgPrice: currentPrice,
              currentPrice,
              dailyChange: marketData[asset as keyof typeof marketData].change,
            },
      }));

      // AI response to trade
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "ai",
            message: `Good choice! You just bought ${amount} shares of ${
              investmentNames[asset as keyof typeof investmentNames]
            }. Based on my analysis, this timing is quite good. Remember to diversify your risk!`,
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    }
  };

  const handleSell = (asset: string, amount: number) => {
    const holding = portfolio[asset];
    if (holding && holding.shares >= amount) {
      const currentPrice = marketData[asset as keyof typeof marketData].price;
      const proceeds = amount * currentPrice;

      setCash((prev) => prev + proceeds);
      setPortfolio((prev) => ({
        ...prev,
        [asset]: {
          ...prev[asset],
          shares: prev[asset].shares - amount,
        },
      }));

      // AI response to sell
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "ai",
            message: `You sold ${amount} shares of ${
              investmentNames[asset as keyof typeof investmentNames]
            } for $${proceeds.toFixed(
              2
            )}. Taking profits at the right time is a wise decision!`,
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "user",
          message: newMessage,
          timestamp: new Date(),
        },
      ]);

      // Mock AI response
      setTimeout(() => {
        const responses = [
          "Based on current market trends, I recommend focusing on tech stock performance.",
          "Now is a good time to consider diversifying into different asset classes.",
          "Remember, long-term investing beats short-term speculation for stable returns.",
          "Market volatility is normal, stay calm and stick to your investment strategy.",
          "Consider regularly reviewing your portfolio and making necessary adjustments.",
        ];
        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            message: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
          },
        ]);
      }, 1500);

      setNewMessage("");
    }
  };

  const handleEndCompetition = () => {
    onEndCompetition({
      finalValue: totalValue,
      totalReturn: dailyReturn,
      portfolio: portfolio,
      cash: cash,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => onEndCompetition(null)}
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Setup
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Investment Competition - Day {day}
            </h1>
            <p className="text-muted-foreground">
              Investing with {selectedCoach.name}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleEndCompetition}
            className="bg-destructive hover:bg-destructive/90"
          >
            End Competition
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Summary */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Assets
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        ${totalValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cash</p>
                      <p className="text-xl font-bold text-foreground">
                        ${cash.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {dailyReturn >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-chart-1" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-chart-2" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Return
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          dailyReturn >= 0 ? "text-chart-1" : "text-chart-2"
                        }`}
                      >
                        {dailyReturn >= 0 ? "+" : ""}
                        {dailyReturn.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">P&L</p>
                      <p
                        className={`text-xl font-bold ${
                          totalValue >= startingCapital
                            ? "text-chart-1"
                            : "text-chart-2"
                        }`}
                      >
                        ${(totalValue - startingCapital).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Performance Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    {/* 用时间戳做横轴 */}
                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={[0, 24]}
                      ticks={hourlyTicks}
                      tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                      stroke="var(--muted-foreground)"
                    />

                    {/* 固定纵轴 */}
                    <YAxis
                      domain={["auto", "auto"]}
                      stroke="var(--muted-foreground)"
                    />

                    <Tooltip
                      labelFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                      formatter={(val, name) => {
                        const num = Number(val);
                        return [
                          `$${num.toFixed(2)}`,
                          name === "total" ? "Total" : name,
                        ];
                      }}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      name="total"
                    />

                    {Object.entries(portfolio).map(([asset, holding], idx) =>
                      holding.shares > 0 ? (
                        <Line
                          key={asset}
                          type="monotone"
                          dataKey={asset} // 我们在 perf 点里把每个资产价格写成了 { apple: 123, ... }
                          stroke={`var(--chart-${(idx % 5) + 1})`} // 颜色可按需定义/替换
                          strokeWidth={1.75}
                          dot={false}
                          isAnimationActive={false}
                          name={
                            investmentNames[
                              asset as keyof typeof investmentNames
                            ] || asset
                          }
                        />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Holdings & Trading */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Holdings & Trading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(portfolio).map(([asset, holding]) => {
                    if (holding.shares > 0) {
                      const currentValue =
                        holding.shares * holding.currentPrice;
                      const gainLoss =
                        ((holding.currentPrice - holding.avgPrice) /
                          holding.avgPrice) *
                        100;

                      return (
                        <div
                          key={asset}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {
                                investmentNames[
                                  asset as keyof typeof investmentNames
                                ]
                              }
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Shares: {holding.shares.toFixed(4)}</span>
                              <span>
                                Avg Price: ${holding.avgPrice.toFixed(2)}
                              </span>
                              <span>
                                Current: ${holding.currentPrice.toFixed(2)}
                              </span>
                              <Badge
                                className={
                                  gainLoss >= 0
                                    ? "bg-chart-1 text-white"
                                    : "bg-chart-2 text-white"
                                }
                              >
                                {gainLoss >= 0 ? "+" : ""}
                                {gainLoss.toFixed(2)}%
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              ${currentValue.toFixed(2)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBuy(asset, 1)}
                                disabled={cash < holding.currentPrice}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                <ShoppingCart className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleSell(asset, Math.min(1, holding.shares))
                                }
                                disabled={holding.shares < 1}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Coach Chat */}
          <div className="lg:col-span-1">
            <CoachChat
              selectedCoach={selectedCoach}
              chatMessages={chatMessages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
