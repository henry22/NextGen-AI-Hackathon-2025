"use client";

import { useState, useEffect, useRef } from "react";
import { api, handleApiError, withLoading } from "@/lib/api";
import InvestmentCompetition from "@/components/investment-competition";
import TradingDashboard from "@/components/trading-dashboard";
import CompetitionResults from "@/components/competition-results";

// Import new components
import { GameHeader } from "@/components/game/GameHeader";
import { CoachSidebar } from "@/components/game/CoachSidebar";
import { ProgressCard } from "@/components/game/ProgressCard";
import { TimelineSection } from "@/components/game/TimelineSection";
import { EventDetailModal } from "@/components/modals/EventDetailModal";
import { MissionModal } from "@/components/modals/MissionModal";
import { SummaryModal } from "@/components/modals/SummaryModal";

// Import data
import { financialEvents, FinancialEvent } from "@/components/data/events";
import { aiCoaches, AICoach } from "@/components/data/coaches";
import { missionData, MissionData } from "@/components/data/missions";

export default function FinancialTimelineGame() {
  const [currentPage, setCurrentPage] = useState<
    "timeline" | "competition" | "trading" | "results"
  >("timeline");
  const [selectedEvent, setSelectedEvent] = useState<FinancialEvent | null>(null);
  const [missionEvent, setMissionEvent] = useState<FinancialEvent | null>(null);
  const [selectedCoach, setSelectedCoach] = useState(aiCoaches[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const summaryTimerRef = useRef<number | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [coachAdvice, setCoachAdvice] = useState<any>(null);
  const [competitionUnlocked, setCompetitionUnlocked] = useState(false);
  const [competitionConfig, setCompetitionConfig] = useState<{
    portfolio: any;
    coach: any;
  } | null>(null);
  const [resultsData, setResultsData] = useState<{
    finalValue: number;
    totalReturn: number;
  } | null>(null);

  // Mission game state management
  const [missionStep, setMissionStep] = useState<
    "intro" | "decision" | "result"
  >("intro");
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(
    null
  );
  const [missionResult, setMissionResult] = useState<any>(null);

  const updateUnlockStatus = () => {
    financialEvents.forEach((event) => {
      if (event.unlockRequirements.length > 0) {
        const allRequirementsMet = event.unlockRequirements.every(
          (requiredYear) => {
            const requiredEvent = financialEvents.find(
              (e) => e.year === requiredYear
            );
            return requiredEvent?.completed === true;
          }
        );
        event.unlocked = allRequirementsMet;
      }
    });
  };

  useEffect(() => {
    updateUnlockStatus();
  }, []);

  const handleEventClick = async (event: FinancialEvent) => {
    if (event.unlocked) {
      setSelectedEvent(event);

      // Load price data for the mission
      try {
        await withLoading(
          api.getPrices(["VTI", "BND", "GLD"], "1y"),
          setApiLoading
        );
      } catch (error) {
        setApiError(handleApiError(error));
      }
    }
  };

  const startMission = () => {
    if (selectedEvent) {
      setMissionEvent(selectedEvent); // Save the event for mission modal
      setGameStarted(true);
      setMissionStep("intro");
      setSelectedEvent(null); // Close event detail modal
    }
  };

  const makeInvestment = async (optionId: string) => {
    if (!missionEvent) return;

    const mission = missionData[missionEvent.year as keyof typeof missionData];
    const option = mission.options.find((opt) => opt.id === optionId);

    if (option) {
      setSelectedInvestment(optionId);

      // Simulate investment using API
      try {
        const simulationRequest = {
          initial_capital: 100000,
          asset_weights: {
            [option.name]: 1.0, // 100% allocation to selected option
          },
          trading_type: "open" as const,
          investment_goal: "balanced" as const,
          time_horizon: 365,
        };

        const result = await withLoading(
          api.simulateInvestment(simulationRequest),
          setApiLoading
        );

        setSimulationResult(result);
      } catch (error) {
        setApiError(handleApiError(error));
      }

      setMissionResult({
        option,
        actualReturn: option.actualReturn,
        finalAmount: 100000 * (1 + option.actualReturn / 100),
        performance: option.actualReturn > 0 ? "profit" : "loss",
      });
      setMissionStep("result");
    }
  };

  const completeMission = () => {
    if (missionEvent && missionResult) {
      const baseReward = missionEvent.reward;
      const performanceBonus = missionResult.performance === "profit" ? 50 : 0;
      const totalReward = baseReward + performanceBonus;

      setPlayerXP((prev) => prev + totalReward);
      setTotalScore((prev) => prev + totalReward);

      setCompletedMissions((prev) => [...prev, missionEvent.title]);

      const eventIndex = financialEvents.findIndex(
        (e) => e.year === missionEvent.year
      );
      if (eventIndex !== -1) {
        financialEvents[eventIndex].completed = true;
        // Update unlock status for other events
        updateUnlockStatus();
      }

      if (
        missionEvent.year === 2025 &&
        missionEvent.title === "Current Challenges"
      ) {
        setCompetitionUnlocked(true);
      }

      setGameStarted(false);
      setMissionEvent(null);
      setMissionStep("intro");
      setSelectedInvestment(null);
      setMissionResult(null);
    }
  };

  const allMissionsCompleted = financialEvents.every(
    (event) => event.completed
  );

  useEffect(() => {
    if (allMissionsCompleted && !showSummary && !summaryDismissed) {
      summaryTimerRef.current = window.setTimeout(() => {
        setShowSummary(true);
      }, 1000);
    }

    return () => {
      if (summaryTimerRef.current) {
        clearTimeout(summaryTimerRef.current);
        summaryTimerRef.current = null;
      }
    };
  }, [allMissionsCompleted, showSummary, summaryDismissed]);

  const startCompetition = () => {
    setCurrentPage("competition");
  };

  const handleStartTrading = (portfolio: any, coach: any) => {
    setCompetitionConfig({ portfolio, coach });
    setCurrentPage("trading");
  };

  const handleEndCompetition = (results: any) => {
    console.log("[handleEndCompetition] results:", results);
    if (
      results &&
      typeof results.finalValue === "number" &&
      typeof results.totalReturn === "number"
    ) {
      setResultsData({
        finalValue: results.finalValue,
        totalReturn: results.totalReturn,
      });
      setCurrentPage("results");
    } else {
      setCurrentPage("competition");
    }
  };

  const handleBackToHome = () => {
    setCurrentPage("timeline");
    setCompetitionConfig(null);
    setResultsData(null);
  };

  const closeMissionModal = () => {
    setGameStarted(false);
    setMissionEvent(null);
    setMissionStep("intro");
    setSelectedInvestment(null);
    setMissionResult(null);
  };

  const currentMission = missionEvent
    ? missionData[missionEvent.year as keyof typeof missionData]
    : null;

  // Handle different page states
  if (currentPage === "competition") {
    return (
      <InvestmentCompetition
        onBack={() => setCurrentPage("timeline")}
        onStartTrading={handleStartTrading}
      />
    );
  }

  if (currentPage === "trading" && competitionConfig) {
    return (
      <TradingDashboard
        initialPortfolio={competitionConfig.portfolio}
        selectedCoach={competitionConfig.coach}
        onEndCompetition={handleEndCompetition}
      />
    );
  }

  if (currentPage === "results" && resultsData) {
    return (
      <CompetitionResults
        finalValue={resultsData.finalValue}
        totalReturn={resultsData.totalReturn}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Main timeline page
  return (
    <div className="min-h-screen bg-background">
      <GameHeader
        playerLevel={playerLevel}
        playerXP={playerXP}
        totalScore={totalScore}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CoachSidebar
              coaches={aiCoaches}
              selectedCoach={selectedCoach}
              onCoachSelect={setSelectedCoach}
            />

            <ProgressCard
              playerXP={playerXP}
              completedCount={financialEvents.filter((e) => e.completed).length}
              availableCount={financialEvents.filter((e) => e.unlocked).length}
            />
          </div>

          {/* Main Timeline */}
          <div className="lg:col-span-3">
            <TimelineSection
              events={financialEvents}
              competitionUnlocked={competitionUnlocked}
              onEventClick={handleEventClick}
              onStartCompetition={startCompetition}
            />
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        selectedCoach={selectedCoach}
        onClose={() => setSelectedEvent(null)}
        onStartMission={startMission}
      />

      {/* Mission Modal */}
      <MissionModal
        open={gameStarted}
        event={missionEvent}
        selectedCoach={selectedCoach}
        missionData={currentMission}
        missionStep={missionStep}
        selectedInvestment={selectedInvestment}
        missionResult={missionResult}
        simulationResult={simulationResult}
        playerLevel={playerLevel}
        completedMissions={completedMissions}
        onClose={closeMissionModal}
        onStepChange={setMissionStep}
        onInvestmentSelect={setSelectedInvestment}
        onInvestmentConfirm={makeInvestment}
        onMissionComplete={completeMission}
      />

      {/* Summary Modal */}
      <SummaryModal
        open={showSummary}
        playerXP={playerXP}
        totalScore={totalScore}
        events={financialEvents}
        onClose={() => {
          setShowSummary(false);
          setSummaryDismissed(true);
        }}
        onRestart={() => window.location.reload()}
      />
    </div>
  );
}