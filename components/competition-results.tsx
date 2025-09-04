"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Star,
  Crown,
  Target,
} from "lucide-react";

interface CompetitionResultsProps {
  finalValue: number;
  totalReturn: number;
  onBackToHome: () => void;
}

// Mock leaderboard data
const weeklyLeaderboard = [
  {
    rank: 1,
    name: "Investment Master Wang",
    return: 15.8,
    profit: 158.0,
    avatar: "👑",
  },
  { rank: 2, name: "Stock God Lee", return: 12.3, profit: 123.0, avatar: "🏆" },
  { rank: 3, name: "Fund Queen", return: 9.7, profit: 97.0, avatar: "💎" },
  { rank: 4, name: "You", return: 8.5, profit: 85.0, avatar: "🎯" },
  { rank: 5, name: "Crypto Newbie", return: 6.2, profit: 62.0, avatar: "🚀" },
  { rank: 6, name: "Value Investor", return: 4.8, profit: 48.0, avatar: "📈" },
  {
    rank: 7,
    name: "Technical Analyst",
    return: 3.1,
    profit: 31.0,
    avatar: "📊",
  },
  {
    rank: 8,
    name: "Long-term Holder",
    return: 1.9,
    profit: 19.0,
    avatar: "⏰",
  },
];

const monthlyLeaderboard = [
  {
    rank: 1,
    name: "Monthly Champion",
    return: 28.5,
    profit: 285.0,
    avatar: "👑",
  },
  {
    rank: 2,
    name: "Steady Investor",
    return: 22.1,
    profit: 221.0,
    avatar: "🏆",
  },
  {
    rank: 3,
    name: "Tech Stock King",
    return: 18.9,
    profit: 189.0,
    avatar: "💎",
  },
  { rank: 4, name: "ETF Expert", return: 15.2, profit: 152.0, avatar: "📈" },
  { rank: 5, name: "You", return: 12.8, profit: 128.0, avatar: "🎯" },
  { rank: 6, name: "Crypto Master", return: 10.5, profit: 105.0, avatar: "🚀" },
  {
    rank: 7,
    name: "Diversified Investor",
    return: 8.7,
    profit: 87.0,
    avatar: "📊",
  },
  { rank: 8, name: "New Investor", return: 6.3, profit: 63.0, avatar: "⭐" },
];

const allTimeLeaderboard = [
  {
    rank: 1,
    name: "Legendary Investor",
    return: 45.2,
    profit: 452.0,
    avatar: "👑",
  },
  { rank: 2, name: "Stock Veteran", return: 38.7, profit: 387.0, avatar: "🏆" },
  {
    rank: 3,
    name: "Investment Professor",
    return: 32.4,
    profit: 324.0,
    avatar: "💎",
  },
  { rank: 4, name: "Fund Manager", return: 28.9, profit: 289.0, avatar: "📈" },
  { rank: 5, name: "Quant Trader", return: 25.1, profit: 251.0, avatar: "🤖" },
  { rank: 6, name: "Value Finder", return: 21.8, profit: 218.0, avatar: "🔍" },
  { rank: 7, name: "You", return: 18.5, profit: 185.0, avatar: "🎯" },
  {
    rank: 8,
    name: "Trend Follower",
    return: 15.3,
    profit: 153.0,
    avatar: "📊",
  },
];

export default function CompetitionResults({
  finalValue,
  totalReturn,
  onBackToHome,
}: CompetitionResultsProps) {
  const [activeTab, setActiveTab] = useState("weekly");

  const userRank = 4; // Mock user rank
  const profit = finalValue - 1000;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    } else if (rank <= 10) {
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
    } else {
      return "bg-muted text-muted-foreground";
    }
  };

  const getCurrentLeaderboard = () => {
    switch (activeTab) {
      case "weekly":
        return weeklyLeaderboard;
      case "monthly":
        return monthlyLeaderboard;
      case "all":
        return allTimeLeaderboard;
      default:
        return weeklyLeaderboard;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-3 sm:mb-4">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Competition Results
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Congratulations on completing the investment competition!
          </p>
        </div>

        {/* User Performance Summary */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-2xl font-serif text-foreground flex items-center justify-center gap-1 sm:gap-2">
                <Target className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Final Assets
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    ${finalValue.toFixed(2)}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {totalReturn >= 0 ? (
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-chart-1" />
                    ) : (
                      <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-chart-2" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Total Return
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-bold ${
                      totalReturn >= 0 ? "text-chart-1" : "text-chart-2"
                    }`}
                  >
                    {totalReturn >= 0 ? "+" : ""}
                    {totalReturn.toFixed(2)}%
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    P&L Amount
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-bold ${
                      profit >= 0 ? "text-chart-1" : "text-chart-2"
                    }`}
                  >
                    {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getRankIcon(userRank)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Ranking
                  </p>
                  <Badge
                    className={`text-sm sm:text-lg px-2 sm:px-3 py-1 ${getRankBadge(
                      userRank
                    )}`}
                  >
                    #{userRank}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboards */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-2xl font-serif text-foreground flex items-center gap-1 sm:gap-2">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                  <TabsTrigger
                    value="weekly"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger
                    value="monthly"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="all"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                    All Time
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value={activeTab}
                  className="space-y-2 sm:space-y-3"
                >
                  {getCurrentLeaderboard().map((player, index) => (
                    <div
                      key={index}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg transition-all hover:shadow-md ${
                        player.name === "You"
                          ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {getRankIcon(player.rank)}
                          <Badge
                            className={`${getRankBadge(
                              player.rank
                            )} min-w-[40px] sm:min-w-[60px] justify-center text-xs sm:text-sm`}
                          >
                            #{player.rank}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-lg sm:text-2xl">
                            {player.avatar}
                          </span>
                          <div>
                            <p
                              className={`font-semibold text-sm sm:text-base ${
                                player.name === "You"
                                  ? "text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              {player.name}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              P&L: {player.profit >= 0 ? "+" : ""}$
                              {player.profit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p
                          className={`text-base sm:text-lg font-bold ${
                            player.return >= 0 ? "text-chart-1" : "text-chart-2"
                          }`}
                        >
                          {player.return >= 0 ? "+" : ""}
                          {player.return.toFixed(1)}%
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Return Rate
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={onBackToHome}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold shadow-lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
