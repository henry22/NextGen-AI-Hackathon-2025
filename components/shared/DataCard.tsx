import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DataCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function DataCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend = "neutral", 
  className = "" 
}: DataCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-primary";
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="flex justify-center items-center mb-2 h-8">
            {icon}
          </div>
          <p className="font-medium text-sm">{title}</p>
          <p className={`text-2xl font-bold ${getTrendColor()}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}