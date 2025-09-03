"use client";

import { useState, useEffect, useRef } from "react";

// Import components
import { GameHeader } from "@/components/game/GameHeader";
import { CoachSidebar } from "@/components/game/CoachSidebar";
import { ProgressCard } from "@/components/game/ProgressCard";
import { TimelineSection } from "@/components/game/TimelineSection";
import { EventDetailModal } from "@/components/modals/EventDetailModal";
import { MissionModal } from "@/components/modals/MissionModal";
import { SummaryModal } from "@/components/modals/SummaryModal";
import { RewardsModal } from "@/components/modals/RewardsModal";

// Import data
import { financialEvents, FinancialEvent } from "@/components/data/events";
import { aiCoaches } from "@/components/data/coaches";
import { missionData } from "@/components/data/missions";

export default function TimelinePage() {
  // State management
  const [selectedEvent, setSelectedEvent] = useState<FinancialEvent | null>(
    null
  );
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
  const [competitionUnlocked, setCompetitionUnlocked] = useState(false);
  const [showRewardsStore, setShowRewardsStore] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);

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

  const allMissionsCompleted = financialEvents.every(
    (event) => event.completed
  );

  useEffect(() => {
    updateUnlockStatus();
  }, []);

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

  const handleEventClick = async (event: FinancialEvent) => {
    if (event.unlocked) {
      setSelectedEvent(event);
    }
  };

  const startMission = (event: FinancialEvent) => {
    setSelectedEvent(null);
    setMissionEvent(event);
    setGameStarted(true);
    setMissionStep("intro");
  };

  const makeInvestment = async (optionId: string) => {
    if (!missionEvent) return;
    const mission = missionData[missionEvent.year as keyof typeof missionData];
    const option = mission?.options.find((opt) => opt.id === optionId);

    if (option) {
      setSelectedInvestment(optionId);

      // Calculate coach-adjusted returns based on selected coach
      const getCoachAdjustedReturn = (
        baseReturn: number,
        coachPersonality: string
      ) => {
        const adjustmentFactors = {
          "Conservative Coach": 0.8, // More conservative, reduce extreme losses/gains
          "Balanced Coach": 1.0, // No adjustment, balanced approach
          "Aggressive Coach": 1.3, // More aggressive, amplify returns
          "Income Coach": 0.9, // Slightly conservative, focus on stability
        };
        const factor =
          adjustmentFactors[
            coachPersonality as keyof typeof adjustmentFactors
          ] || 1.0;
        // Apply adjustment with some randomness
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const adjustedReturn = baseReturn * factor * randomFactor;
        // Ensure returns stay within reasonable bounds
        return Math.max(-0.8, Math.min(2.0, adjustedReturn));
      };

      const adjustedReturn = getCoachAdjustedReturn(
        option.actualReturn,
        selectedCoach.personality
      );
      const finalAmount = 10000 * (1 + adjustedReturn);
      const performance = adjustedReturn > 0 ? "profit" : "loss";

      setMissionResult({
        option,
        actualReturn: adjustedReturn,
        finalAmount,
        performance,
      });

      setMissionStep("result");
    }
  };

  const completeMission = () => {
    if (missionEvent && missionResult) {
      // Only give the exact base mission reward - no performance bonus
      // Button interaction XP is already being added in real-time via handleXpEarned
      const missionReward = missionEvent.reward; // Use exact reward value: 100, 150, 200

      // Update player progress with just the mission base reward
      setPlayerXP((prev) => prev + missionReward);
      setTotalScore((prev) => prev + missionReward);
      setCompletedMissions((prev) => [...prev, missionEvent.title]);

      // Update event completion status
      const eventIndex = financialEvents.findIndex(
        (e) => e.year === missionEvent.year
      );
      if (eventIndex !== -1) {
        financialEvents[eventIndex].completed = true;
        // Update unlock status for other events
        updateUnlockStatus();
      }

      // Level up logic
      const newLevel = Math.floor((playerXP + missionReward) / 1000) + 1;
      if (newLevel > playerLevel) {
        setPlayerLevel(newLevel);
      }

      // Check if competition is unlocked (when specific event completed)
      if (
        missionEvent.year === 2025 &&
        missionEvent.title === "Current Challenges"
      ) {
        setCompetitionUnlocked(true);
      }

      closeMissionModal();
    }
  };

  const startCompetition = () => {
    // Navigate to competition page using Next.js router
    window.location.href = "/competition";
  };

  const redeemReward = (reward: any) => {
    if (playerXP >= reward.cost && !redeemedRewards.includes(reward.id)) {
      setPlayerXP((prev) => prev - reward.cost);
      setRedeemedRewards((prev) => [...prev, reward.id]);
      // In a real app, this would trigger the actual reward delivery
      // The email and voucher code are now handled in the RedeemConfirmModal
    }
  };

  // Real-time XP callback for button interactions
  const handleXpEarned = (amount: number) => {
    setPlayerXP((prev) => prev + amount);
    setTotalScore((prev) => prev + amount);
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

  return (
    <div className="min-h-screen bg-background">
      <GameHeader
        playerLevel={playerLevel}
        playerXP={playerXP}
        totalScore={totalScore}
        onRewardsClick={() => setShowRewardsStore(true)}
      />

      <div className="container mx-auto sm:px-4 py-8">
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
              availableCount={
                financialEvents.filter((e) => e.unlocked && !e.completed).length
              }
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
        onStartMission={() => selectedEvent && startMission(selectedEvent)}
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
        simulationResult={null}
        playerLevel={playerLevel}
        completedMissions={completedMissions}
        onClose={closeMissionModal}
        onStepChange={setMissionStep}
        onInvestmentSelect={setSelectedInvestment}
        onInvestmentConfirm={makeInvestment}
        onMissionComplete={completeMission}
        onXpEarned={handleXpEarned}
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

      {/* Rewards Modal */}
      <RewardsModal
        open={showRewardsStore}
        onOpenChange={setShowRewardsStore}
        playerXP={playerXP}
        redeemedRewards={redeemedRewards}
        onRedeemReward={redeemReward}
      />
    </div>
  );
}
