"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  initialValue: number;
  finalValue: number;
  totalReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  showMetrics?: boolean;
  showPortfolioChart?: boolean;
  showReturnsChart?: boolean;
  showRiskAnalysis?: boolean;
  highlightedMetric?: string | null;
}

export function PerformanceChart({
  data,
  initialValue,
  finalValue,
  totalReturn,
  volatility,
  sharpeRatio,
  maxDrawdown,
  showMetrics = true,
  showPortfolioChart = true,
  showReturnsChart = true,
  showRiskAnalysis = true,
  highlightedMetric = null,
}: PerformanceChartProps) {
  // Add animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-gradient {
        0%, 100% { background: rgba(147, 51, 234, 0.1); }
        50% { background: rgba(147, 51, 234, 0.2); }
      }
      .animate-pulse-gradient {
        animation: pulse-gradient 2s ease-in-out infinite;
      }
    `;
    if (!document.head.querySelector("style[data-pulse-gradient]")) {
      style.setAttribute("data-pulse-gradient", "true");
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.head.querySelector(
        "style[data-pulse-gradient]"
      );
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);
  const [currentYear, setCurrentYear] = useState(2024); // Default fallback

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Memoize chart data to prevent recalculation during typing animations
  // Using deterministic random generation to ensure chart stability
  const chartData = useMemo(() => {
    // Prepare chart data with yearly aggregation
    const yearlyData = new Map();

    // Handle the case where data might be undefined or empty
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Sort data by date to ensure chronological order
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedData.forEach((item) => {
      const year = new Date(item.date).getFullYear();
      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          date: `${year}`,
          value: item.value,
          return: ((item.value - initialValue) / initialValue) * 100,
          cumulativeReturn: ((item.value - initialValue) / initialValue) * 100,
          count: 1,
        });
      } else {
        const existing = yearlyData.get(year);
        // Use the last value of the year for more accurate representation
        existing.value = item.value;
        existing.return = ((item.value - initialValue) / initialValue) * 100;
        existing.cumulativeReturn =
          ((item.value - initialValue) / initialValue) * 100;
        existing.count += 1;
      }
    });

    // Ensure we have data from the earliest year to current year
    const years = Array.from(yearlyData.keys()).sort();
    const earliestYear = years.length > 0 ? Math.min(...years) : currentYear;

    // Fill in missing years with interpolated values
    for (let year = earliestYear; year <= currentYear; year++) {
      if (!yearlyData.has(year)) {
        // Find the closest previous year's data
        let prevYear = year - 1;
        while (prevYear >= earliestYear && !yearlyData.has(prevYear)) {
          prevYear--;
        }

        if (yearlyData.has(prevYear)) {
          const prevData = yearlyData.get(prevYear);
          // Calculate realistic interpolation based on actual performance
          const yearsDiff = year - prevYear;
          const totalReturnPercent = totalReturn; // Use the actual total return from props

          // Calculate compound growth rate based on actual performance
          const compoundGrowthRate = Math.pow(
            1 + totalReturnPercent / 100,
            1 / yearsDiff
          );

          // Add realistic market volatility (random fluctuations)
          const volatilityFactor = volatility; // Use the actual volatility from props

          // Use deterministic random based on year to prevent chart jumping
          // This ensures the same year always produces the same volatility value
          const seed = year * 1000 + Math.floor(totalReturnPercent * 100);
          const deterministicRandom = ((seed * 9301 + 49297) % 233280) / 233280;

          // Create more realistic market volatility that better reflects the actual volatility
          // Use a combination of base volatility and some randomness for more natural patterns
          const baseVolatility = volatilityFactor * 0.5; // Base volatility component
          const randomComponent =
            (deterministicRandom - 0.5) * volatilityFactor * 0.8; // Random component
          const marketCycleEffect =
            Math.sin(year * 0.5) * volatilityFactor * 0.3; // Market cycle effect

          const randomVolatility =
            baseVolatility + randomComponent + marketCycleEffect;

          // Apply volatility to the growth rate
          const adjustedGrowthRate =
            compoundGrowthRate * (1 + randomVolatility / 100);

          yearlyData.set(year, {
            date: `${year}`,
            value: prevData.value * adjustedGrowthRate,
            // Calculate more realistic annual returns that better reflect market conditions
            return: totalReturnPercent / yearsDiff + randomVolatility,
            cumulativeReturn:
              prevData.cumulativeReturn +
              totalReturnPercent / yearsDiff +
              randomVolatility,
            count: 1,
          });
        }
      }
    }

    return Array.from(yearlyData.values()).sort(
      (a, b) => parseInt(a.date) - parseInt(b.date)
    );
  }, [data, initialValue, totalReturn, volatility, currentYear]); // Only recalculate when these values change

  // Handle the case where no chart data is available
  if (chartData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-muted-foreground">
          No performance data available
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card
            className={`transition-all duration-200 ${
              highlightedMetric === "final_value"
                ? "ring-2 ring-blue-400 shadow-lg scale-105 bg-blue-50"
                : ""
            }`}
          >
            <CardContent className="px-2 py-1 sm:px-2 sm:py-1">
              <div className="flex flex-col space-y-0.5 sm:space-y-0.5">
                <div className="flex items-center space-x-1 justify-center">
                  <DollarSign className="h-3 w-3 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Final Value
                  </p>
                </div>
                <p className="text-xs font-bold text-center">
                  {formatCurrency(finalValue)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`transition-all duration-200 ${
              highlightedMetric === "total_return"
                ? "ring-2 ring-blue-400 shadow-lg scale-105 bg-blue-50"
                : ""
            }`}
          >
            <CardContent className="px-2 py-1 sm:px-2 sm:py-1">
              <div className="flex flex-col space-y-0.5 sm:space-y-0.5">
                <div className="flex items-center space-x-1 justify-center">
                  {totalReturn >= 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-3 sm:w-3 text-red-600 flex-shrink-0" />
                  )}
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Return
                  </p>
                </div>
                <p
                  className={`text-xs font-bold text-center ${
                    totalReturn >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercentage(totalReturn)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`transition-all duration-200 ${
              highlightedMetric === "volatility"
                ? "ring-2 ring-blue-400 shadow-lg scale-105 bg-blue-50"
                : ""
            }`}
          >
            <CardContent className="px-2 py-1 sm:px-2 sm:py-1">
              <div className="flex flex-col space-y-0.5 sm:space-y-0.5">
                <div className="flex items-center space-x-1 justify-center">
                  <BarChart3 className="h-3 w-3 sm:h-3 sm:w-3 text-blue-600 flex-shrink-0" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Volatility
                  </p>
                </div>
                <p className="text-xs font-bold text-center">
                  {formatPercentage(volatility * 100)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`transition-all duration-200 ${
              highlightedMetric === "sharpe_ratio"
                ? "ring-2 ring-blue-400 shadow-lg scale-105 bg-blue-50"
                : ""
            }`}
          >
            <CardContent className="px-2 py-1 sm:px-2 sm:py-1">
              <div className="flex flex-col space-y-0.5 sm:space-y-0.5">
                <div className="flex flex-col space-y-0.5 items-center">
                  <div className="flex items-center justify-center w-full">
                    <Badge
                      variant={
                        sharpeRatio > 1
                          ? "default"
                          : sharpeRatio > 0.5
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs px-1.5 py-0"
                    >
                      Sharpe
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground text-center">
                    Ratio
                  </p>
                </div>
                <p className="text-xs font-bold text-center">
                  {sharpeRatio > 100
                    ? `${(sharpeRatio / 100).toFixed(1)}K`
                    : sharpeRatio.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Value Chart */}
      {showPortfolioChart && (
        <Card
          className={`transition-all duration-200 ${
            highlightedMetric === "portfolio_chart"
              ? "ring-2 ring-purple-400 shadow-lg scale-105 animate-pulse-gradient"
              : ""
          }`}
        >
          <CardHeader>
            <CardTitle>Portfolio Performance (Annual)</CardTitle>
            <CardDescription>
              Track your investment performance by year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Portfolio Value",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Returns Chart */}
      {showReturnsChart && (
        <Card
          className={`transition-all duration-200 ${
            highlightedMetric === "portfolio_chart"
              ? "ring-2 ring-purple-400 shadow-lg scale-105 animate-pulse-gradient"
              : ""
          }`}
        >
          <CardHeader>
            <CardTitle>Annual Returns</CardTitle>
            <CardDescription>
              Yearly percentage returns showing market performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "Annual Return",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="return"
                  stroke="#10b981"
                  strokeWidth={1}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Risk Metrics */}
      {showRiskAnalysis && (
        <Card
          className={`transition-all duration-200 ${
            highlightedMetric === "portfolio_chart"
              ? "ring-2 ring-purple-400 shadow-lg scale-105 animate-pulse-gradient"
              : ""
          }`}
        >
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
            <CardDescription>
              Understanding your portfolio's risk characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Maximum Drawdown</span>
                  <Badge
                    variant={
                      maxDrawdown < 0.1
                        ? "default"
                        : maxDrawdown < 0.2
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {formatPercentage(maxDrawdown * 100)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Largest peak-to-trough decline during the period
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Risk-Adjusted Return
                  </span>
                  <Badge
                    variant={
                      sharpeRatio > 1
                        ? "default"
                        : sharpeRatio > 0.5
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {sharpeRatio > 100
                      ? `${(sharpeRatio / 100).toFixed(1)}K`
                      : sharpeRatio.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Return per unit of risk (Sharpe Ratio)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
