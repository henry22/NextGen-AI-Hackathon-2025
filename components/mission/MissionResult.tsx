import React from "react";
import { InvestmentOption } from "@/components/data/missions";
import { FinancialEvent } from "@/components/data/events";
import { TeachingDialogue } from "@/components/mission/TeachingDialogue";
import { aiCoaches, AICoach } from "@/components/data/coaches";

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
  selectedCoach: AICoach; // Add selectedCoach prop
  onComplete: () => void;
  onXpEarned?: (amount: number) => void;
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
  selectedCoach, // Add selectedCoach parameter
  onComplete,
  onXpEarned,
}: MissionResultProps) {
  return (
    <div className="space-y-6">
      {/* Teaching AI Coach Dialogue */}
      <div className="mt-6">
        <TeachingDialogue
          coach={selectedCoach} // Use the selected coach instead of playerLevel-based coach
          selectedOption={selectedOption}
          actualReturn={actualReturn}
          finalAmount={finalAmount}
          performance={performance}
          outcome={outcome}
          event={event}
          simulationResult={simulationResult}
          onComplete={onComplete}
          onXpEarned={onXpEarned}
        />
      </div>
    </div>
  );
}
