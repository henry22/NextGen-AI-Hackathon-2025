"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Target,
  Brain,
  Apple,
  Cpu,
  Car,
  Building,
  Coins,
  Bitcoin,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

interface InvestmentOptionMeta {
  id: string;
  name: string;
  type: "stock" | "fund" | "crypto";
  icon: any;
  risk: "low" | "medium" | "high";
  description: string;
}

interface Quote {
  currentPrice: number;
  change: number; // %
}
interface AICoach {
  id: string;
  name: string;
  avatar: string;
  style: string;
  description: string;
  specialty: string;
  successRate: number;
  gif?: string;
}

const investmentOptions: InvestmentOptionMeta[] = [
  {
    id: "apple",
    name: "Apple Inc.",
    type: "stock",
    icon: Apple,
    risk: "medium",
    description: "Global tech giant, iPhone manufacturer",
  },
  {
    id: "microsoft",
    name: "Microsoft Corp.",
    type: "stock",
    icon: Building,
    risk: "medium",
    description: "Cloud services and software leader",
  },
  {
    id: "nvidia",
    name: "NVIDIA Corp.",
    type: "stock",
    icon: Cpu,
    risk: "high",
    description: "AI chips and graphics processor leader",
  },
  {
    id: "tesla",
    name: "Tesla Inc.",
    type: "stock",
    icon: Car,
    risk: "high",
    description: "Electric vehicle and clean energy innovator",
  },
  {
    id: "sp500",
    name: "S&P 500 ETF",
    type: "fund",
    icon: TrendingUp,
    risk: "low",
    description: "Tracks US top 500 companies index",
  },
  {
    id: "etf",
    name: "Global ETF",
    type: "fund",
    icon: Building,
    risk: "low",
    description: "Global diversified investment portfolio",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    type: "crypto",
    icon: Bitcoin,
    risk: "high",
    description: "Digital gold, cryptocurrency king",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    type: "crypto",
    icon: Coins,
    risk: "high",
    description: "Smart contract platform leader",
  },
];

const aiCoaches: AICoach[] = [
  {
    id: "conservative",
    name: "Steady Sam",
    avatar: "/avatars/conservative.png",
    style: "Conservative",
    description: "Focuses on risk control and stable returns",
    specialty: "Defensive investment strategies",
    successRate: 78,
    gif: "/gifs/conservative.gif",
  },
  {
    id: "balanced",
    name: "Balanced Bella",
    avatar: "/avatars/balanced.png",
    style: "Balanced",
    description: "Finds the best balance between risk and return",
    specialty: "Diversified asset allocation",
    successRate: 82,
    gif: "/gifs/balanced.gif",
  },
  {
    id: "aggressive",
    name: "Adventure Alex",
    avatar: "/avatars/aggressive.png",
    style: "Aggressive",
    description: "Pursues high returns, willing to take risks",
    specialty: "Growth stocks and emerging markets",
    successRate: 85,
    gif: "/gifs/aggressive.gif",
  },
  {
    id: "tech",
    name: "Tech Taylor",
    avatar: "/avatars/tech.png",
    style: "Tech-focused",
    description: "Specialises in tech stocks and innovative investments",
    specialty: "AI and tech trend analysis",
    successRate: 88,
    gif: "/gifs/master.gif",
  },
];

interface InvestmentCompetitionProps {
  onBack: () => void;
  onStartTrading: (portfolio: Record<string, number>, coach: AICoach) => void;
}

export default function InvestmentCompetition({
  onBack,
  onStartTrading,
}: InvestmentCompetitionProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [selectedCoach, setSelectedCoach] = useState<AICoach | null>(null);
  const [totalAllocated, setTotalAllocated] = useState(0);

  const startingCapital = 5000;

  // —— 新增：行情状态 —— //
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // 拉取后端 /quotes
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const fetchQuotes = async () => {
      try {
        setLoadingQuotes(true);
        setQuoteError(null);

        // 构建重复参数：?ids=a&ids=b...
        const ids = investmentOptions.map((o) => o.id);
        const params = new URLSearchParams();
        ids.forEach((id) => params.append("ids", id));
        const url = `${API_BASE}/quotes?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const map: Record<string, Quote> = {};
        (data?.quotes ?? []).forEach((q: any) => {
          map[q.id] = { currentPrice: q.currentPrice, change: q.change };
        });
        setQuotes(map);
      } catch (e: any) {
        setQuoteError(e?.message ?? "Failed to fetch quotes");
      } finally {
        setLoadingQuotes(false);
      }
    };

    fetchQuotes();
    // 轮询刷新（可按需调整 30s）
    timer = setInterval(fetchQuotes, 30000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const updateAllocation = (optionId: string, amount: number) => {
    // 限制 amount 不超过剩余可用资金 + 原来这个 option 的值
    const maxAllowed =
      startingCapital - totalAllocated + (allocations[optionId] || 0);
    const safeAmount = Math.min(amount, maxAllowed);

    const newAllocations = { ...allocations, [optionId]: safeAmount };
    const newTotal = Object.values(newAllocations).reduce(
      (sum, val) => sum + val,
      0
    );

    setAllocations(newAllocations);
    setTotalAllocated(newTotal);
  };

  const remainingCapital = startingCapital - totalAllocated;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock":
        return TrendingUp;
      case "fund":
        return Shield;
      case "crypto":
        return Zap;
      default:
        return Target;
    }
  };

  const canStartCompetition = selectedCoach && totalAllocated > 0;

  const startCompetition = () => {
    if (canStartCompetition) {
      onStartTrading(allocations, selectedCoach);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Timeline
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Investment Competition
            </h1>
            <p className="text-muted-foreground">
              Use your $5,000 starting capital to begin your investment journey
            </p>
          </div>
          <div className="w-24" />
        </div>

        {/* Quotes loading/error */}
        {loadingQuotes && (
          <p className="text-sm text-muted-foreground mb-4">
            Loading latest prices…
          </p>
        )}
        {quoteError && (
          <p className="text-sm text-red-600 mb-4">
            Failed to load quotes: {quoteError}
          </p>
        )}

        {/* Capital Overview */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <DollarSign className="h-6 w-6" /> Capital Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Starting Capital
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${startingCapital}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Allocated</p>
                <p className="text-2xl font-bold text-secondary">
                  ${totalAllocated}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-accent">
                  ${remainingCapital}
                </p>
              </div>
            </div>
            <Progress
              value={(totalAllocated / startingCapital) * 100}
              className="mt-4"
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Investment Options */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold mb-6">
              Choose Investment Targets
            </h2>

            {/* Stocks */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Stocks
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {investmentOptions
                  .filter((o) => o.type === "stock")
                  .map((option) => {
                    const Icon = option.icon;
                    const q = quotes[option.id];
                    const price = q?.currentPrice;
                    const change = q?.change ?? 0;

                    return (
                      <Card
                        key={option.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-6 w-6 text-primary" />
                              <div>
                                <CardTitle className="text-base">
                                  {option.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            <Badge className={getRiskColor(option.risk)}>
                              {option.risk === "low"
                                ? "Low Risk"
                                : option.risk === "medium"
                                ? "Medium Risk"
                                : "High Risk"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold">
                              {price != null ? `$${price.toFixed(2)}` : "--"}
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                change >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {change >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {change >= 0 ? "+" : ""}
                              {change.toFixed(2)}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Investment Amount</span>
                              <span>${allocations[option.id] || 0}</span>
                            </div>
                            <Slider
                              value={[allocations[option.id] || 0]}
                              onValueChange={(value) =>
                                updateAllocation(option.id, value[0])
                              }
                              max={startingCapital}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Funds */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Funds
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {investmentOptions
                  .filter((o) => o.type === "fund")
                  .map((option) => {
                    const Icon = option.icon;
                    const q = quotes[option.id];
                    const price = q?.currentPrice;
                    const change = q?.change ?? 0;

                    return (
                      <Card
                        key={option.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-6 w-6 text-primary" />
                              <div>
                                <CardTitle className="text-base">
                                  {option.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            <Badge className={getRiskColor(option.risk)}>
                              {option.risk === "low"
                                ? "Low Risk"
                                : option.risk === "medium"
                                ? "Medium Risk"
                                : "High Risk"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold">
                              {price != null ? `$${price.toFixed(2)}` : "--"}
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                change >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {change >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {change >= 0 ? "+" : ""}
                              {change.toFixed(2)}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Investment Amount</span>
                              <span>${allocations[option.id] || 0}</span>
                            </div>
                            <Slider
                              value={[allocations[option.id] || 0]}
                              onValueChange={(value) =>
                                updateAllocation(option.id, value[0])
                              }
                              max={
                                remainingCapital + (allocations[option.id] || 0)
                              }
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Crypto */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Cryptocurrency
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {investmentOptions
                  .filter((o) => o.type === "crypto")
                  .map((option) => {
                    const Icon = option.icon;
                    const q = quotes[option.id];
                    const price = q?.currentPrice;
                    const change = q?.change ?? 0;

                    return (
                      <Card
                        key={option.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-6 w-6 text-primary" />
                              <div>
                                <CardTitle className="text-base">
                                  {option.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            <Badge className={getRiskColor(option.risk)}>
                              {option.risk === "low"
                                ? "Low Risk"
                                : option.risk === "medium"
                                ? "Medium Risk"
                                : "High Risk"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold">
                              {price != null
                                ? `$${price.toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}`
                                : "--"}
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                change >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {change >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {change >= 0 ? "+" : ""}
                              {change.toFixed(2)}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Investment Amount</span>
                              <span>${allocations[option.id] || 0}</span>
                            </div>
                            <Slider
                              value={[allocations[option.id] || 0]}
                              onValueChange={(value) =>
                                updateAllocation(option.id, value[0])
                              }
                              max={
                                remainingCapital + (allocations[option.id] || 0)
                              }
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
          {/* AI Coach Selection */}
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Choose AI Coach
            </h2>
            <div className="space-y-4">
              {aiCoaches.map((coach) => (
                <Card
                  key={coach.id}
                  className={`cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg ${
                    selectedCoach?.id === coach.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedCoach(coach)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={coach.avatar}
                        alt={coach.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {coach.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {coach.style}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {coach.successRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Success Rate
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {coach.description}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      Specialty: {coach.specialty}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Start Competition Button */}
            <Card className="mt-8 border-primary/20">
              <CardContent className="pt-6">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!canStartCompetition}
                  onClick={startCompetition}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Start Competition
                </Button>
                {!canStartCompetition && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Please select investments and AI coach
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
