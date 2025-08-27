import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { MissionIntro } from "@/components/mission/MissionIntro";
import { InvestmentDecision } from "@/components/mission/InvestmentDecision";
import { MissionResult } from "@/components/mission/MissionResult";
import { FinancialEvent } from "@/components/data/events";
import { AICoach } from "@/components/data/coaches";
import { MissionData, InvestmentOption } from "@/components/data/missions";

type MissionStep = "intro" | "decision" | "result";

interface MissionModalProps {
  open: boolean;
  event: FinancialEvent | null;
  selectedCoach: AICoach;
  missionData: MissionData | null;
  missionStep: MissionStep;
  selectedInvestment: string | null;
  missionResult: {
    option: InvestmentOption;
    actualReturn: number;
    finalAmount: number;
    performance: "profit" | "loss";
  } | null;
  simulationResult: any;
  playerLevel: number;
  completedMissions: string[];
  onClose: () => void;
  onStepChange: (step: MissionStep) => void;
  onInvestmentSelect: (optionId: string) => void;
  onInvestmentConfirm: (optionId: string) => void;
  onMissionComplete: () => void;
}

export function MissionModal({
  open,
  event,
  selectedCoach,
  missionData,
  missionStep,
  selectedInvestment,
  missionResult,
  simulationResult,
  playerLevel,
  completedMissions,
  onClose,
  onStepChange,
  onInvestmentSelect,
  onInvestmentConfirm,
  onMissionComplete,
}: MissionModalProps) {
  if (!event || !missionData) return null;

  const getDialogTitle = () => {
    switch (missionStep) {
      case "intro":
        return `Time Travel: ${event.year}`;
      case "decision":
        return "Investment Decision Time";
      case "result":
        return "Mission Results";
      default:
        return `${event.year} - ${event.title}`;
    }
  };

  const getDialogDescription = () => {
    switch (missionStep) {
      case "intro":
        return event.title;
      case "decision":
        return "Choose your investment strategy - each choice will affect the final outcome";
      case "result":
        return "Let's see how your investment decision turned out";
      default:
        return event.description;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            {missionStep === "result" && missionResult && (
              missionResult.performance === "profit" ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )
            )}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-base">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        {missionStep === "intro" && (
          <MissionIntro
            missionData={missionData}
            selectedCoach={selectedCoach}
            onNext={() => onStepChange("decision")}
            onExit={onClose}
          />
        )}

        {missionStep === "decision" && (
          <InvestmentDecision
            options={missionData.options}
            selectedInvestment={selectedInvestment}
            onInvestmentSelect={onInvestmentSelect}
            onConfirm={() => selectedInvestment && onInvestmentConfirm(selectedInvestment)}
            onBack={() => onStepChange("intro")}
          />
        )}

        {missionStep === "result" && missionResult && (
          <MissionResult
            selectedOption={missionResult.option}
            actualReturn={missionResult.actualReturn}
            finalAmount={missionResult.finalAmount}
            performance={missionResult.performance}
            outcome={missionData.outcome}
            event={event}
            simulationResult={simulationResult}
            playerLevel={playerLevel}
            completedMissions={completedMissions}
            onComplete={onMissionComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}