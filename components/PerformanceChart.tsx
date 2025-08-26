"use client";

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
  data: {
    dates: string[];
    values: number[];
    returns: number[];
  };
  initialValue: number;
  finalValue: number;
  totalReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export function PerformanceChart({
  data,
  initialValue,
  finalValue,
  totalReturn,
  volatility,
  sharpeRatio,
  maxDrawdown,
}: PerformanceChartProps) {
  // Prepare chart data
  const chartData = data.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    value: data.values[index],
    return: data.returns[index] * 100, // Convert to percentage
    cumulativeReturn:
      ((data.values[index] - initialValue) / initialValue) * 100,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Final Value
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(finalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Return
                </p>
                <p
                  className={`text-2xl font-bold ${
                    totalReturn >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercentage(totalReturn * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Volatility
                </p>
                <p className="text-2xl font-bold">
                  {formatPercentage(volatility * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  sharpeRatio > 1
                    ? "default"
                    : sharpeRatio > 0.5
                    ? "secondary"
                    : "destructive"
                }
              >
                Sharpe
              </Badge>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sharpe Ratio
                </p>
                <p className="text-2xl font-bold">{sharpeRatio.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Value Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>
            Track your investment performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-AU", {
                    month: "short",
                    day: "numeric",
                  })
                }
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
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-AU")
                }
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

      {/* Returns Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Returns</CardTitle>
          <CardDescription>
            Daily percentage returns showing market volatility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-AU", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(2)}%`,
                  "Daily Return",
                ]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-AU")
                }
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

      {/* Risk Metrics */}
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
                  {sharpeRatio.toFixed(2)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Return per unit of risk (Sharpe Ratio)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
