import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Trophy } from "lucide-react";
import { InvestmentOption } from "@/components/data/missions";
import { FinancialEvent } from "@/components/data/events";
import { AICoach } from "@/components/AICoach";
import { PerformanceChart } from "@/components/PerformanceChart";

interface MissionResultProps {
  selectedOption: InvestmentOption;
  actualReturn: number;
  finalAmount: number;
  performance: "profit" | "loss";
  outcome: string;
  event: FinancialEvent;
  simulationResult?: any;
  playerLevel: number;
  completedMissions: string[];
  onComplete: () => void;
}

export function MissionResult({ 
  selectedOption, 
  actualReturn, 
  finalAmount, 
  performance, 
  outcome, 
  event, 
  simulationResult,
  playerLevel,
  completedMissions,
  onComplete 
}: MissionResultProps) {
  const getPerformanceColor = (isProfit: boolean) => {
    return isProfit ? "text-green-600" : "text-red-600";
  };

  const getPerformanceBg = (isProfit: boolean) => {
    return isProfit ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      <Card className={getPerformanceBg(performance === "profit")}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">You chose</p>
              <p className="text-xl font-bold">{selectedOption.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Initial Investment</p>
                <p className="text-lg font-semibold">$100,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actual Return Rate</p>
                <p className={`text-lg font-semibold ${getPerformanceColor(performance === "profit")}`}>
                  {actualReturn > 0 ? "+" : ""}{actualReturn}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final Amount</p>
                <p className={`text-lg font-semibold ${getPerformanceColor(performance === "profit")}`}>
                  ${finalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h4 className="font-serif font-semibold mb-3">Historical Truth</h4>
          <p className="text-sm leading-relaxed">{outcome}</p>
        </CardContent>
      </Card>

      <Card className="bg-accent/10">
        <CardContent className="pt-6">
          <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Rewards Earned
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Base XP: {event.reward} XP</p>
              {performance === "profit" && (
                <p className="text-sm text-green-600">Performance Bonus: +50 XP</p>
              )}
            </div>
            <p className="text-xl font-bold text-primary">
              Total: {event.reward + (performance === "profit" ? 50 : 0)} XP
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Coach Section */}
      {simulationResult && (
        <div className="mt-6">
          <AICoach
            playerLevel={
              playerLevel === 1 ? "beginner" : playerLevel === 2 ? "intermediate" : "advanced"
            }
            currentPortfolio={{ [selectedOption.name]: 1.0 }}
            investmentGoal="balanced"
            riskTolerance={0.5}
            completedMissions={completedMissions}
            currentMission={event.title}
            onAdviceReceived={() => {}}
          />
        </div>
      )}

      {/* Performance Chart */}
      {simulationResult && simulationResult.performance_chart && (
        <div className="mt-6">
          <PerformanceChart
            data={simulationResult.performance_chart}
            initialValue={100000}
            finalValue={simulationResult.final_value || 100000}
            totalReturn={simulationResult.total_return || 0}
            volatility={simulationResult.volatility || 0.15}
            sharpeRatio={simulationResult.sharpe_ratio || 0.5}
            maxDrawdown={simulationResult.max_drawdown || -0.1}
          />
        </div>
      )}

      <Button onClick={onComplete} className="w-full font-medium">
        <CheckCircle className="h-4 w-4 mr-2" />
        Complete Mission
      </Button>
    </div>
  );
}