import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricsGrid, MetricItem } from "@/components/shared/MetricsGrid";
import { Trophy, Users } from "lucide-react";

interface ProgressCardProps {
  playerXP: number;
  completedCount: number;
  availableCount: number;
  maxXP?: number;
}

export function ProgressCard({ 
  playerXP, 
  completedCount, 
  availableCount, 
  maxXP = 1000 
}: ProgressCardProps) {
  const progressMetrics: MetricItem[] = [
    {
      id: "completed",
      icon: <Trophy className="h-6 w-6 text-primary" />,
      title: "Completed Missions",
      value: completedCount,
    },
    {
      id: "available",
      icon: <Users className="h-6 w-6 text-secondary" />,
      title: "Available Missions",
      value: availableCount,
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Experience Points</span>
              <span>{playerXP}/{maxXP}</span>
            </div>
            <Progress value={(playerXP / maxXP) * 100} className="h-2" />
          </div>
          
          <MetricsGrid metrics={progressMetrics} columns={2} />
        </div>
      </CardContent>
    </Card>
  );
}