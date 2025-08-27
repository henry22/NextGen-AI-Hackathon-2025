import React from "react";
import { DataCard } from "./DataCard";

export interface MetricItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

interface MetricsGridProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricsGrid({ 
  metrics, 
  columns = 2, 
  className = "" 
}: MetricsGridProps) {
  const getGridClass = () => {
    switch (columns) {
      case 3:
        return "grid-cols-1 md:grid-cols-3";
      case 4:
        return "grid-cols-2 md:grid-cols-4";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className={`grid gap-4 ${getGridClass()} ${className}`}>
      {metrics.map((metric) => (
        <DataCard
          key={metric.id}
          icon={metric.icon}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          trend={metric.trend}
        />
      ))}
    </div>
  );
}