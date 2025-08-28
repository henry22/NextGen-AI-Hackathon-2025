"use client";

import { useState, useEffect, useRef } from "react";
import { api, handleApiError, withLoading } from "@/lib/api";
import InvestmentCompetition from "@/components/investment-competition";
import TradingDashboard from "@/components/trading-dashboard";
import CompetitionResults from "@/components/competition-results";
import { Play } from "lucide-react";

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
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentPage, setCurrentPage] = useState<
    "timeline" | "competition" | "trading" | "results"
  >("timeline");
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

  const allMissionsCompleted = financialEvents.every(
    (event) => event.completed
  );

  // All useEffect hooks must be at the top level, before any conditional returns
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

  // Render start screen if not started
  if (showStartScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Game Logo and Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                <div className="h-12 w-12 text-primary text-4xl">⏰</div>
              </div>
              <h1 className="text-6xl font-serif font-black text-primary mb-2">
                Legacy Guardians
              </h1>
              <p className="text-2xl font-medium text-muted-foreground">
                Time-Warp Wealth Adventure
              </p>
            </div>

            {/* Game Description */}
            <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  Master Wealth Wisdom Through Time Travel
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Welcome to the financial history time adventure! You'll travel
                  to key moments of major financial events, learn investment
                  strategies with AI coaches, and experience real financial
                  decisions in a risk-free environment.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                      <div className="h-6 w-6 text-green-600 text-xl">📈</div>
                    </div>
                    <h3 className="font-semibold mb-2">Learn Investing</h3>
                    <p className="text-sm text-muted-foreground">
                      Master risk management and asset allocation
                    </p>
                  </div>

                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                      <div className="h-6 w-6 text-blue-600 text-xl">📚</div>
                    </div>
                    <h3 className="font-semibold mb-2">Historical Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Understand the causes and effects of financial crises
                    </p>
                  </div>

                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                      <div className="h-6 w-6 text-purple-600 text-xl">🤖</div>
                    </div>
                    <h3 className="font-semibold mb-2">AI Coaches</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional coaches provide personalized guidance
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Features */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="text-left bg-card rounded-lg shadow-lg p-6 h-full min-w-0">
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
                  <div className="h-5 w-5 text-primary text-lg">🎯</div>
                  Game Features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Experience major financial events from 1990-2025
                    </span>
                  </li>
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Risk-free learning environment to safely explore
                      investment strategies
                    </span>
                  </li>
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Personalized AI coach guidance and feedback
                    </span>
                  </li>
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Progressive unlock system and achievement tracking
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-left bg-card rounded-lg shadow-lg p-6 h-full min-w-0">
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
                  <div className="h-5 w-5 text-primary text-lg">🏆</div>
                  Learning Objectives
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Understand the relationship between risk and reward
                    </span>
                  </li>
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Learn diversified investment strategies
                    </span>
                  </li>
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Master market cycles and timing judgment
                    </span>
                  </li>
                  <li className="flex items-start gap-2 min-h-[1.5rem]">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="leading-relaxed">
                      Develop long-term investment thinking
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Start Game Button */}
            <div className="pt-8">
              <button
                onClick={() => setShowStartScreen(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-12 py-6 font-semibold rounded-lg transition-colors"
              >
                <Play className="inline-block h-6 w-6 mr-3" />
                Start Time Adventure
              </button>
              <p className="text-sm text-muted-foreground mt-4">
                Ready to travel through time and become a wealth guardian?
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        return Math.max(-80, Math.min(100, adjustedReturn));
      };

      // Get real historical data instead of simulation
      try {
        // Map investment options to real tickers
        const tickerMap: Record<string, string> = {
          "Japanese Stocks": "^N225", // Nikkei 225
          "Tokyo Real Estate": "^N225", // Using Nikkei as proxy
          "US Treasury Bonds": "^TNX", // 10-year Treasury yield
          Gold: "GLD", // Gold ETF
          "US Dollar Cash": "UUP", // US Dollar ETF
          "Australian Stocks": "^AXJO", // ASX 200
          Bitcoin: "BTC-USD", // Bitcoin
          Ethereum: "ETH-USD", // Ethereum
        };

        const ticker = tickerMap[option.name] || "^GSPC"; // Default to S&P 500
        const eventYear = parseInt(
          missionEvent.title.match(/\d{4}/)?.[0] || "1990"
        );

        // Fetch real historical performance
        const realData = await withLoading(
          api.getHistoricalPerformance(ticker, eventYear),
          setApiLoading
        );

        setSimulationResult(realData);
      } catch (error) {
        setApiError(handleApiError(error));
        // Fall back to option's default data
        setSimulationResult(null);
      }

      // Calculate coach-adjusted return
      const coachAdjustedReturn = getCoachAdjustedReturn(
        option.actualReturn,
        selectedCoach.personality
      );
      const finalAmount = 100000 * (1 + coachAdjustedReturn / 100);

      setMissionResult({
        option,
        actualReturn: coachAdjustedReturn,
        finalAmount: finalAmount,
        performance: coachAdjustedReturn > 0 ? "profit" : "loss",
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
