"use client";

import { useState, useEffect } from "react";
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
}: PerformanceChartProps) {
  const [currentYear, setCurrentYear] = useState(2024); // Default fallback

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Prepare chart data with yearly aggregation
  const yearlyData = new Map();

  // Handle the case where data might be undefined or empty
  if (!data || !Array.isArray(data)) {
    return (
      <div className="space-y-6">
        <div className="text-center text-muted-foreground">
          No performance data available
        </div>
      </div>
    );
  }

  data.forEach((item) => {
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
      existing.value = item.value; // Use the last value of the year
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
        yearlyData.set(year, {
          date: `${year}`,
          value: prevData.value * 1.05, // Assume 5% growth per year
          return: 5.0, // 5% annual return
          cumulativeReturn: prevData.cumulativeReturn + 5.0,
          count: 1,
        });
      }
    }
  }

  const chartData = Array.from(yearlyData.values()).sort(
    (a, b) => parseInt(a.date) - parseInt(b.date)
  );

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
    <div className="space-y-6">
      {/* Performance Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3 text-green-600 flex-shrink-0" />
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

          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  {totalReturn >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 flex-shrink-0" />
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

          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-3 w-3 text-blue-600 flex-shrink-0" />
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

          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      sharpeRatio > 1
                        ? "default"
                        : sharpeRatio > 0.5
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs px-1 py-0"
                  >
                    Sharpe
                  </Badge>
                  <p className="text-xs font-medium text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance (Annual)</CardTitle>
            <CardDescription>
              Track your investment performance by year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
        <Card>
          <CardHeader>
            <CardTitle>Annual Returns</CardTitle>
            <CardDescription>
              Yearly percentage returns showing market performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
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
        <Card>
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
