"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api, handleApiError } from "@/lib/api";
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
  style: string; // e.g. "Conservative Coach" | "Balanced Coach" | "Aggressive Coach" | "Tech Coach"
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
  nvidia: { price: 178.1, change: 4.2 },
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

  // user input: per-asset trade qty
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});

  // live prices
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.keys(marketData).map((k) => [k, (marketData as any)[k].price])
    )
  );

  type PerfPoint = { time: number; total: number } & Record<string, number>;
  const [performanceData, setPerformanceData] = useState<PerfPoint[]>([
    {
      time: 0,
      total: startingCapital,
      ...Object.fromEntries(
        Object.keys(marketData).map((k) => [k, (marketData as any)[k].price])
      ),
    },
  ]);

  // refs for timer loop
  const hourRef = useRef(0);
  const runningRef = useRef(true);
  const cashRef = useRef(cash);
  const portfolioRef = useRef(portfolio);
  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);
  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  // market simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const nextHour = hourRef.current + 1;
      if (nextHour > 24 || !runningRef.current) {
        runningRef.current = false;
        clearInterval(interval);
        return;
      }
      let nextPrices: Record<string, number> = {};
      setPrices((prev) => {
        const next: Record<string, number> = { ...prev };
        Object.keys(prev).forEach((asset) => {
          const rf = 1 + (Math.random() * 0.1 - 0.05);
          next[asset] = Math.max(0, next[asset] * rf);
        });
        nextPrices = next;
        return next;
      });
      let portfolioValue = 0;
      Object.entries(portfolioRef.current).forEach(([asset, holding]) => {
        const p = nextPrices[asset] ?? (marketData as any)[asset].price;
        portfolioValue += holding.shares * p;
      });
      const newTotal = portfolioValue + cashRef.current;
      setPerformanceData((prev) => [
        ...prev,
        { time: nextHour, total: newTotal, ...nextPrices },
      ]);
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
      hourRef.current = nextHour;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const hourlyTicks = useMemo(() => {
    if (performanceData.length === 0) return [0];
    const maxHour = performanceData[performanceData.length - 1].time;
    return Array.from({ length: maxHour + 1 }, (_, i) => i);
  }, [performanceData]);

  // init from initialPortfolio
  useEffect(() => {
    const initialCash =
      startingCapital -
      Object.values(initialPortfolio).reduce((sum, val) => sum + val, 0);
    setCash(initialCash);

    const newPortfolio: Portfolio = {};
    Object.entries(initialPortfolio).forEach(([asset, allocation]) => {
      if (allocation > 0) {
        const currentPrice = (marketData as any)[asset].price;
        const shares = allocation / currentPrice;
        newPortfolio[asset] = {
          shares,
          avgPrice: currentPrice,
          currentPrice,
          dailyChange: (marketData as any)[asset].change,
        };
      }
    });
    setPortfolio(newPortfolio);
    setTradeQty(
      Object.fromEntries(Object.keys(newPortfolio).map((k) => [k, 0.1]))
    );

    // initial greeting (from AI backend or local)
    setChatMessages([
      {
        id: "1",
        sender: "ai",
        message: `Hello! I'm ${selectedCoach.name}, your AI coach. Share your plan or make a move and I'll react.`,
        timestamp: new Date(),
      },
    ]);
  }, [initialPortfolio, selectedCoach, startingCapital]);

  // recompute totals
  useEffect(() => {
    const portfolioValue = Object.values(portfolio).reduce(
      (sum, holding) => sum + holding.shares * holding.currentPrice,
      0
    );
    const newTotalValue = portfolioValue + cash;
    setTotalValue(newTotalValue);
    setDailyReturn(((newTotalValue - startingCapital) / startingCapital) * 100);
  }, [portfolio, cash, startingCapital]);

  const getLivePrice = (asset: string) =>
    prices[asset] ?? (marketData as any)[asset].price;

  // ====================
  // Coach API integration
  // ====================
  type CoachAction = {
    type: "buy" | "sell";
    asset: string;
    amount: number;
    price: number;
  };

  function updateChatMessageById(
    id: string,
    updater: (old: ChatMessage) => ChatMessage
  ) {
    setChatMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }

  async function askCoach({
    userMessage,
    action,
    snapshot,
  }: {
    userMessage?: string;
    action?: {
      type: "buy" | "sell";
      asset: string;
      amount: number;
      price: number;
    };
    snapshot?: { portfolio: Portfolio; cash: number };
  }) {
    // 1) Insert placeholder AI message first
    const pendingId = (Date.now() + Math.random()).toString();
    setChatMessages((prev) => [
      ...prev,
      {
        id: pendingId,
        sender: "ai",
        message: "Thinking…",
        timestamp: new Date(),
      },
    ]);

    // Wait for the next frame and give the UI a chance to render
    const nextFrame = () =>
      new Promise<void>((r) => requestAnimationFrame(() => r()));
    await nextFrame();

    try {
      // 2) Request the backend again
      const { reply } = await api.getCoachChat({
        selectedCoach,
        userMessage,
        portfolio: snapshot?.portfolio ?? portfolio,
        cash: snapshot?.cash ?? cash,
        action,
      });

      // 3) Typewriter effect
      function typeIntoMessage(id: string, fullText: string, speedMs = 20) {
        let i = 0;
        const tick = () => {
          i += 2; // Two characters each time
          updateChatMessageById(id, (old) => ({
            ...old,
            message: fullText.slice(0, i),
          }));
          if (i < fullText.length) setTimeout(tick, speedMs);
        };
        tick();
      }

      typeIntoMessage(pendingId, reply ?? "Updated.");
    } catch (error: any) {
      // 4) If there is an error, replace it with the error message
      updateChatMessageById(pendingId, (old) => ({
        ...old,
        message:
          handleApiError(error) || "Something went wrong. Please try again.",
        timestamp: new Date(),
      }));
    }
  }

  // replace mock chat with real backend call
  const sendMessage = async () => {
    const msg = newMessage.trim();
    if (!msg) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        message: msg,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
    await askCoach({ userMessage: msg });
  };

  // compute snapshot first, then setState, then call backend with snapshot
  const handleBuy = (asset: string, amount: number) => {
    const price = getLivePrice(asset);
    const cost = amount * price;
    if (!(amount > 0 && cost <= cash)) return;

    // snapshot
    const snapPortfolio: Portfolio = JSON.parse(JSON.stringify(portfolio));
    const prev = snapPortfolio[asset];
    if (prev) {
      const totalCost = prev.shares * prev.avgPrice + cost;
      const totalShares = prev.shares + amount;
      snapPortfolio[asset] = {
        ...prev,
        shares: totalShares,
        avgPrice: totalCost / totalShares,
        currentPrice: price,
      };
    } else {
      snapPortfolio[asset] = {
        shares: amount,
        avgPrice: price,
        currentPrice: price,
        dailyChange: (marketData as any)[asset].change,
      };
    }
    const snapCash = cash - cost;

    setCash(snapCash);
    setPortfolio(snapPortfolio);

    // AI reaction
    askCoach({
      action: { type: "buy", asset, amount, price },
      snapshot: { portfolio: snapPortfolio, cash: snapCash },
    });
  };

  const handleSell = (asset: string, amount: number) => {
    const holding = portfolio[asset];
    if (!(holding && amount > 0 && holding.shares > 0)) return;

    const price = getLivePrice(asset);
    const sellAmount = Math.min(amount, holding.shares);
    const proceeds = sellAmount * price;

    const snapPortfolio: Portfolio = JSON.parse(JSON.stringify(portfolio));
    snapPortfolio[asset] = {
      ...snapPortfolio[asset],
      shares: snapPortfolio[asset].shares - sellAmount,
      currentPrice: price,
    };
    const snapCash = cash + proceeds;

    setCash(snapCash);
    setPortfolio(snapPortfolio);

    // AI reaction
    askCoach({
      action: { type: "sell", asset, amount: sellAmount, price },
      snapshot: { portfolio: snapPortfolio, cash: snapCash },
    });
  };

  const handleEndCompetition = () => {
    onEndCompetition({
      finalValue: totalValue,
      totalReturn: dailyReturn,
      portfolio,
      cash,
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
                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={[0, 24]}
                      ticks={hourlyTicks}
                      tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                      stroke="var(--muted-foreground)"
                    />
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
                          dataKey={asset}
                          stroke={`var(--chart-${(idx % 5) + 1})`}
                          strokeWidth={1.75}
                          dot={false}
                          isAnimationActive={false}
                          name={(investmentNames as any)[asset] || asset}
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
                      const qty = tradeQty[asset] ?? 1;
                      const canBuy =
                        cash >= qty * getLivePrice(asset) && qty > 0;
                      const canSell = holding.shares > 0 && qty > 0;
                      return (
                        <div
                          key={asset}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {(investmentNames as any)[asset]}
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
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground">
                              ${currentValue.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBuy(asset, qty)}
                                disabled={!canBuy}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                title={
                                  !canBuy
                                    ? "Not enough cash or invalid qty"
                                    : "Buy"
                                }
                              >
                                <ShoppingCart className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step={0.1}
                                className="w-16 bg-white text-foreground"
                                value={Number.isFinite(qty) ? qty : 0.1}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  setTradeQty((prev) => ({
                                    ...prev,
                                    [asset]: isNaN(v) ? 0 : v,
                                  }));
                                }}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSell(asset, qty)}
                                disabled={!canSell}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                title={!canSell ? "Invalid qty" : "Sell"}
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
