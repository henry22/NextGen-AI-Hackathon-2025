"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Trophy,
  DollarSign,
  TrendingUp,
  BarChart3,
  Shield,
  HelpCircle,
  Target,
  Zap,
} from "lucide-react";
import { PerformanceChart } from "@/components/PerformanceChart";
import { api, InvestmentMetrics, CoachRequest, CoachResponse } from "@/lib/api";
 

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TeachingDialogueProps {
  coach: {
    name: string;
    avatar: string;
    personality: string;
    color: string;
    description: string;
    animatedAvatar: string;
  };
  selectedOption: {
    name: string;
    id: string;
  };
  actualReturn: number;
  finalAmount: number;
  performance: "profit" | "loss";
  outcome: string;
  event: {
    title: string;
    description: string;
  };
  simulationResult?: any;
  onComplete: () => void;
  onXpEarned?: (amount: number) => void;
}

interface TeachingMessage {
  id: string;
  type: "greeting" | "lesson" | "completion";
  content: string;
  showContinue?: boolean;
  showComplete?: boolean;
  showMetrics?: boolean;
  showChart?: boolean;
  showReturnsChart?: boolean;
  showAnalysis?: boolean;
  metricButtons?: Array<{
    key: string;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    targetMetric: string;
  }>;
}

// ============================================================================
// CONSTANTS & CONFIGURATIONS
// ============================================================================

const TICKER_MAP: Record<string, string> = {
  // 1990 Japanese Bubble options
  "Japanese Stocks": "^N225", // Nikkei 225 - Japanese stock market
  "Tokyo Real Estate": "^N225", // Using Nikkei as proxy for Japanese real estate market (same period correlation)
  "US Treasury Bonds": "^TNX", // 10-year Treasury yield
  Gold: "GLD", // Gold ETF

  // 1997 Asian Financial Crisis options
  "Asian Stocks": "^N225", // Using Nikkei as proxy for Asian markets
  "US Stocks": "^GSPC", // S&P 500
  Bonds: "^TNX", // 10-year Treasury yield

  // 2000 Dot-com Bubble options
  "Tech Stocks": "^IXIC", // NASDAQ
  "Traditional Stocks": "^GSPC", // S&P 500

  // 2008 Financial Crisis options
  "Bank Stocks": "^BKX", // KBW Bank Index
  "Real Estate": "^DJUSRE", // Dow Jones US Real Estate
  "Government Bonds": "^TNX", // 10-year Treasury yield

  // 2020 COVID-19 options
  "Tech Growth": "^IXIC", // NASDAQ
  "Value Stocks": "^GSPC", // S&P 500
  "Safe Havens": "GLD", // Gold ETF

  // General assets
  "US Dollar Cash": "UUP", // US Dollar ETF
  "Australian Stocks": "^AXJO", // ASX 200
  Bitcoin: "BTC-USD", // Bitcoin
  Ethereum: "ETH-USD", // Ethereum
};

const TYPING_SPEED = 15; // milliseconds per character (faster typing)

// Global cache for AI coach advice to prevent duplicate API calls across component instances
const aiAdviceCache = new Map<
  string,
  { data: CoachResponse; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global request lock to prevent duplicate API calls
const activeRequests = new Set<string>();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Maps coach personality to risk tolerance
 */
const getRiskTolerance = (personality: string): number => {
  const toleranceMap: Record<string, number> = {
    "Conservative Coach": 0.2,
    "Balanced Coach": 0.5,
    "Aggressive Coach": 0.8,
    "Income Coach": 0.3,
  };
  return toleranceMap[personality] || 0.5;
};

/**
 * Maps coach personality to investment goal
 */
const getInvestmentGoal = (
  personality: string
): "balanced" | "capital_gains" | "cash_flow" => {
  const goalMap: Record<string, "balanced" | "capital_gains" | "cash_flow"> = {
    "Conservative Coach": "capital_gains",
    "Balanced Coach": "balanced",
    "Aggressive Coach": "capital_gains",
    "Income Coach": "cash_flow",
  };
  return goalMap[personality] || "balanced";
};

/**
 * Extracts year from event title
 */
const extractEventYear = (eventTitle: string): number => {
  const yearMatch = eventTitle.match(/\d{4}/);
  return parseInt(yearMatch?.[0] || "1990");
};

/**
 * Formats percentage with sign
 */
const formatPercentage = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Determines player level based on mission difficulty, performance, and experience
 */
const getPlayerLevel = (
  eventTitle: string,
  actualReturn: number,
  performance: "profit" | "loss",
  selectedOption: string
): "beginner" | "intermediate" | "advanced" => {
  // Mission difficulty analysis based on event title
  const eventDifficulty = getEventDifficulty(eventTitle);

  // Investment option complexity
  const optionComplexity = getOptionComplexity(selectedOption);

  // Performance analysis
  const returnMagnitude = Math.abs(actualReturn);
  const isProfitable = performance === "profit";

  // Calculate difficulty score (0-100)
  let difficultyScore = 0;

  // Event difficulty weight: 40%
  difficultyScore += eventDifficulty * 0.4;

  // Option complexity weight: 30%
  difficultyScore += optionComplexity * 0.3;

  // Performance weight: 30%
  if (isProfitable) {
    difficultyScore += Math.min(returnMagnitude / 2, 30); // Cap at 30 points
  } else {
    difficultyScore += Math.min(returnMagnitude / 4, 15); // Losses get fewer points
  }

  // Determine level based on difficulty score
  if (difficultyScore >= 70) {
    return "advanced";
  } else if (difficultyScore >= 40) {
    return "intermediate";
  } else {
    return "beginner";
  }
};

/**
 * Analyzes event difficulty based on historical context
 */
const getEventDifficulty = (eventTitle: string): number => {
  const title = eventTitle.toLowerCase();

  // High difficulty events (complex market conditions)
  if (
    title.includes("bubble") ||
    title.includes("crisis") ||
    title.includes("crash")
  ) {
    return 90;
  }

  // Medium difficulty events (significant market movements)
  if (
    title.includes("recession") ||
    title.includes("inflation") ||
    title.includes("deflation")
  ) {
    return 70;
  }

  // Moderate difficulty events (market volatility)
  if (
    title.includes("volatility") ||
    title.includes("uncertainty") ||
    title.includes("change")
  ) {
    return 50;
  }

  // Lower difficulty events (stable conditions)
  if (
    title.includes("growth") ||
    title.includes("stability") ||
    title.includes("recovery")
  ) {
    return 30;
  }

  // Default difficulty
  return 40;
};

/**
 * Analyzes investment option complexity
 */
const getOptionComplexity = (selectedOption: string): number => {
  const option = selectedOption.toLowerCase();

  // High complexity options (cryptocurrency, derivatives)
  if (
    option.includes("bitcoin") ||
    option.includes("ethereum") ||
    option.includes("crypto")
  ) {
    return 90;
  }

  // Medium-high complexity (international markets, commodities)
  if (
    option.includes("japanese") ||
    option.includes("australian") ||
    option.includes("gold")
  ) {
    return 70;
  }

  // Medium complexity (bonds, real estate)
  if (
    option.includes("bonds") ||
    option.includes("real estate") ||
    option.includes("treasury")
  ) {
    return 50;
  }

  // Lower complexity (cash, stable assets)
  if (option.includes("cash") || option.includes("dollar")) {
    return 30;
  }

  // Default complexity
  return 50;
};

/**
 * Generates a cache key for AI coach advice
 */
const generateCacheKey = (
  coachName: string,
  selectedOption: string,
  eventTitle: string,
  actualReturn: number,
  finalAmount: number,
  performance: string
): string => {
  return `${coachName}-${selectedOption}-${eventTitle}-${actualReturn}-${finalAmount}-${performance}`;
};

/**
 * Checks if cached AI advice is still valid
 */
const getCachedAdvice = (cacheKey: string): CoachResponse | null => {
  const cached = aiAdviceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

/**
 * Checks if a request is already in progress for the given cache key
 */
const isRequestInProgress = (cacheKey: string): boolean => {
  return activeRequests.has(cacheKey);
};

/**
 * Marks a request as in progress
 */
const markRequestInProgress = (cacheKey: string): void => {
  activeRequests.add(cacheKey);
};

/**
 * Marks a request as completed
 */
const markRequestCompleted = (cacheKey: string): void => {
  activeRequests.delete(cacheKey);
};

/**
 * Stores AI advice in cache
 */
const cacheAdvice = (cacheKey: string, advice: CoachResponse): void => {
  aiAdviceCache.set(cacheKey, { data: advice, timestamp: Date.now() });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TeachingDialogue({
  coach,
  selectedOption,
  actualReturn,
  finalAmount,
  performance,
  outcome,
  event,
  simulationResult,
  onComplete,
  onXpEarned,
}: TeachingDialogueProps) {
  // Add custom styles for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce-slide-up {
        0% { transform: translateY(20px); opacity: 0; }
        30% { transform: translateY(-10px); opacity: 1; }
        50% { transform: translateY(-15px); opacity: 1; }
        70% { transform: translateY(-12px); opacity: 1; }
        100% { transform: translateY(-20px); opacity: 0; }
      }
      
      @keyframes sparkle-1 {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
      }
      
      @keyframes sparkle-2 {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        40% { opacity: 1; transform: scale(1.2) rotate(90deg); }
      }
      
      @keyframes sparkle-3 {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        60% { opacity: 1; transform: scale(0.8) rotate(270deg); }
      }
      
      @keyframes sparkle-4 {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        35% { opacity: 1; transform: scale(1.1) rotate(135deg); }
      }
      
      @keyframes sparkle-5 {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        55% { opacity: 1; transform: scale(0.9) rotate(225deg); }
      }
      
      .animate-bounce-slide-up {
        animation: bounce-slide-up 1.5s ease-out forwards;
      }
      
      .animate-sparkle-1 { animation: sparkle-1 1.2s ease-out infinite; }
      .animate-sparkle-2 { animation: sparkle-2 1.3s ease-out infinite 0.1s; }
      .animate-sparkle-3 { animation: sparkle-3 1.1s ease-out infinite 0.2s; }
      .animate-sparkle-4 { animation: sparkle-4 1.4s ease-out infinite 0.15s; }
      .animate-sparkle-5 { animation: sparkle-5 1.2s ease-out infinite 0.25s; }
      
      @keyframes pulse-gradient {
        0%, 100% { background: rgba(147, 51, 234, 0.1); }
        50% { background: rgba(147, 51, 234, 0.2); }
      }
      
      .animate-pulse-gradient {
        animation: pulse-gradient 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [messages, setMessages] = useState<TeachingMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [realMetrics, setRealMetrics] = useState<InvestmentMetrics | null>(
    null
  );
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [aiCoachAdvice, setAiCoachAdvice] = useState<CoachResponse | null>(
    null
  );
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);
  // Use ref to track if we've already generated dialogue
  const hasGeneratedDialogue = useRef(false);
  // Track whether dialogue was generated with AI advice
  const [dialogueGeneratedWithAi, setDialogueGeneratedWithAi] = useState(false);
  // Track if we've already fetched AI advice to prevent duplicate API calls
  const hasFetchedAiAdvice = useRef(false);
  // Track selected metric button and its explanation
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [metricExplanation, setMetricExplanation] = useState<string>("");
  // Track hover state for metric highlighting
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  // Track XP earned this session
  const [sessionXp, setSessionXp] = useState<number>(0);
  // Track XP animation
  const [showXpAnimation, setShowXpAnimation] = useState<boolean>(false);
  // Track coach typing effect
  const [coachTypingText, setCoachTypingText] = useState<string>("");
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);
  // Track viewed buttons to prevent duplicate XP - separate shared and step-specific
  const [viewedSharedButtons, setViewedSharedButtons] = useState<Set<string>>(new Set());
  const [viewedStepButtons, setViewedStepButtons] = useState<Set<string>>(new Set());

  // Generate cache key for this mission - use useMemo to prevent recreation
  const cacheKey = React.useMemo(
    () =>
      generateCacheKey(
        coach.name,
        selectedOption.name,
        event.title,
        actualReturn,
        finalAmount,
        performance
      ),
    [
      coach.name,
      selectedOption.name,
      event.title,
      actualReturn,
      finalAmount,
      performance,
    ]
  );

  // ============================================================================
  // DIALOGUE GENERATION
  // ============================================================================

  // ============================================================================
  // DATA FETCHING EFFECTS
  // ============================================================================

  // Fetch real investment metrics
  useEffect(() => {
    const fetchRealMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const ticker = TICKER_MAP[selectedOption.name] || "^GSPC"; // Default to S&P 500
        const eventYear = extractEventYear(event.title);
        const metrics = await api.getHistoricalPerformance(ticker, eventYear);
        setRealMetrics(metrics);
      } catch (error) {
        console.error("Failed to fetch real metrics:", error);
        // Fall back to simulation data
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchRealMetrics();
  }, [selectedOption.name, event.title]);

  // Fetch AI coach advice
  useEffect(() => {
    // Check cache first
    const cachedAdvice = getCachedAdvice(cacheKey);
    if (cachedAdvice) {
      setAiCoachAdvice(cachedAdvice);
      hasFetchedAiAdvice.current = true;
      return;
    }

    // Check if request is already in progress globally
    if (isRequestInProgress(cacheKey)) {
      return;
    }

    // Prevent duplicate API calls within this component
    if (hasFetchedAiAdvice.current) {
      return;
    }

    const fetchAiCoachAdvice = async () => {
      markRequestInProgress(cacheKey); // Mark as in progress globally
      setLoadingAiAdvice(true);

      try {
        const coachRequest: CoachRequest = {
          player_level: getPlayerLevel(
            event.title,
            actualReturn,
            performance,
            selectedOption.name
          ),
          current_portfolio: { [selectedOption.name]: 1.0 }, // 100% in selected option
          investment_goal: getInvestmentGoal(coach.personality),
          risk_tolerance: getRiskTolerance(coach.personality),
          time_horizon: 365,
          completed_missions: ["Basic Investment", "Risk Management"],
          current_mission: event.title,
          player_context: `Player just completed an investment mission where they invested in ${
            selectedOption.name
          } during ${
            event.title
          }. The investment resulted in a ${performance} with ${actualReturn}% return, ending with $${Math.round(
            finalAmount
          ).toLocaleString()}. The player is working with ${coach.name} (${
            coach.personality
          }) who specialises in ${coach.description}.`,
        };

        const advice = await api.getCoachAdvice(coachRequest);
        setAiCoachAdvice(advice);
        hasFetchedAiAdvice.current = true; // Mark as fetched

        // Cache the advice for future use
        cacheAdvice(cacheKey, advice);
      } catch (error) {
        console.error("Failed to fetch AI coach advice:", error);
        hasFetchedAiAdvice.current = true; // Mark as fetched even on error
        // Fall back to static content
      } finally {
        setLoadingAiAdvice(false);
        markRequestCompleted(cacheKey); // Mark as completed globally
      }
    };

    fetchAiCoachAdvice();
  }, [cacheKey]); // Only depend on cacheKey changes

  // Generate simplified teaching dialogue function (3 steps instead of 7)
  const generateDialogue = () => {
    const newMessages: TeachingMessage[] = [];
    const useAiAdvice = aiCoachAdvice && !loadingAiAdvice;

    // Only generate dialogue if we have AI advice
    if (!useAiAdvice) {
      return;
    }

    // Step 1: Portfolio Performance (Annual) - Combined greeting + chart
    newMessages.push({
      id: "portfolio_performance",
      type: "greeting",
      content: `${performance === "profit" ? "🎉 Nice work!" : "📊"} Ask ${coach.name} about your ${selectedOption.name} results!`,
      showContinue: true,
      showMetrics: true,
      showChart: true,
      showReturnsChart: false,
      showAnalysis: false,
      metricButtons: [
        {
          key: "final_value",
          label: "Final Value",
          icon: <DollarSign className="h-4 w-4" />,
          targetMetric: "final_value"
        },
        {
          key: "total_return",
          label: "Total Return", 
          icon: <TrendingUp className="h-4 w-4" />,
          targetMetric: "total_return"
        },
        {
          key: "volatility",
          label: "Volatility",
          icon: <BarChart3 className="h-4 w-4" />,
          targetMetric: "volatility"
        },
        {
          key: "sharpe_ratio",
          label: "Sharpe Ratio",
          icon: <Target className="h-4 w-4" />,
          targetMetric: "sharpe_ratio"
        },
        {
          key: "portfolio_chart",
          label: "Portfolio Chart",
          icon: <Shield className="h-4 w-4" />,
          targetMetric: "portfolio_performance"
        }
      ]
    });

    // Step 2: Annual Returns Analysis
    newMessages.push({
      id: "annual_returns", 
      type: "lesson",
      content: `**Annual Returns Analysis** 📈\n\n${aiCoachAdvice.risk_assessment.includes('high') ? 'Notice the volatility!' : 'See the patterns?'} Let ${coach.name} break it down for you.`,
      showContinue: true,
      showMetrics: true,
      showChart: false,
      showReturnsChart: true,
      showAnalysis: false,
      metricButtons: [
        {
          key: "final_value",
          label: "Final Value",
          icon: <DollarSign className="h-4 w-4" />,
          targetMetric: "final_value"
        },
        {
          key: "total_return",
          label: "Total Return", 
          icon: <TrendingUp className="h-4 w-4" />,
          targetMetric: "total_return"
        },
        {
          key: "volatility",
          label: "Volatility",
          icon: <BarChart3 className="h-4 w-4" />,
          targetMetric: "volatility"
        },
        {
          key: "sharpe_ratio",
          label: "Sharpe Ratio",
          icon: <Target className="h-4 w-4" />,
          targetMetric: "sharpe_ratio"
        },
        {
          key: "portfolio_chart",
          label: "Portfolio Chart",
          icon: <Shield className="h-4 w-4" />,
          targetMetric: "portfolio_performance"
        }
      ]
    });

    // Step 3: Risk Analysis
    newMessages.push({
      id: "risk_analysis",
      type: "lesson", 
      content: `**Risk Analysis** ⚖️\n\nUnderstanding risk helps you make smarter choices! Let ${coach.name} help you analyze.`,
      showContinue: true,
      showMetrics: true,
      showChart: false,
      showReturnsChart: false,
      showAnalysis: true,
      metricButtons: [
        {
          key: "final_value",
          label: "Final Value",
          icon: <DollarSign className="h-4 w-4" />,
          targetMetric: "final_value"
        },
        {
          key: "total_return",
          label: "Total Return", 
          icon: <TrendingUp className="h-4 w-4" />,
          targetMetric: "total_return"
        },
        {
          key: "volatility",
          label: "Volatility",
          icon: <BarChart3 className="h-4 w-4" />,
          targetMetric: "volatility"
        },
        {
          key: "sharpe_ratio",
          label: "Sharpe Ratio",
          icon: <Target className="h-4 w-4" />,
          targetMetric: "sharpe_ratio"
        },
        {
          key: "portfolio_chart",
          label: "Portfolio Chart",
          icon: <Shield className="h-4 w-4" />,
          targetMetric: "portfolio_performance"
        }
      ]
    });

    // Step 4: Summary and Completion with detailed recommendations
    newMessages.push({
      id: "summary_completion",
      type: "completion",
      content: `🎉 **Mission Complete!** 🎉\n\n**My Key Recommendations:**\n${aiCoachAdvice.recommendations.slice(0, 3).map(rec => `• ${rec}`).join('\n')}\n\n**Next Steps:**\n${aiCoachAdvice.next_steps.slice(0, 2).map(step => `• ${step}`).join('\n')}\n\n${aiCoachAdvice.encouragement}`,
      showComplete: true,
      showMetrics: false,
      showChart: false,
      showReturnsChart: false,
      showAnalysis: false,
    });

    setMessages(newMessages);
    hasGeneratedDialogue.current = true; // Mark dialogue as generated
    setDialogueGeneratedWithAi(true); // Mark that dialogue was generated with AI advice
  };

  // Generate simplified teaching dialogue
  useEffect(() => {
    // Wait for AI advice to be fetched before generating dialogue
    if (loadingAiAdvice) {
      return; // Don't generate dialogue while loading
    }

    // Only generate dialogue if we have AI advice and haven't generated it yet
    if (aiCoachAdvice && !hasGeneratedDialogue.current) {
      generateDialogue();
    } else if (
      aiCoachAdvice &&
      hasGeneratedDialogue.current &&
      !dialogueGeneratedWithAi
    ) {
      // Regenerate dialogue with AI advice if it wasn't generated with it before
      hasGeneratedDialogue.current = false;
      generateDialogue();
    } else if (
      aiCoachAdvice &&
      hasGeneratedDialogue.current &&
      dialogueGeneratedWithAi
    ) {
      // AI advice available and dialogue already generated with AI advice
    } else {
      // Waiting for AI advice
    }
  }, [
    // Only depend on loadingAiAdvice and aiCoachAdvice
    loadingAiAdvice,
    aiCoachAdvice,
  ]);

  // Track component mount
  useEffect(() => {
    // Clean up old cache entries
    const now = Date.now();
    for (const [key, value] of aiAdviceCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        aiAdviceCache.delete(key);
      }
    }

    return () => {
      // Component unmounting
    };
  }, []);

  // ============================================================================
  // TYPING ANIMATION
  // ============================================================================

  // Typing effect
  useEffect(() => {
    if (messages.length === 0) return;

    const currentMessage = messages[currentMessageIndex];
    if (!currentMessage) return;

    setIsTyping(true);
    setShowContinue(false);
    setDisplayedText("");

    let currentIndex = 0;
    const text = currentMessage.content;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, TYPING_SPEED);
      } else {
        setIsTyping(false);
        setShowContinue(true);
      }
    };

    typeNextChar();
  }, [currentMessageIndex, messages]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleContinue = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleBack = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1);
      // Clear current selection when going back
      setSelectedMetric(null);
      setMetricExplanation("");
      setCoachTypingText("");
      setIsCoachTyping(false);
    }
  };

  const handleMetricClick = async (metricKey: string, targetMetric: string) => {
    // Toggle selection
    const isAlreadySelected = selectedMetric === metricKey;
    setSelectedMetric(isAlreadySelected ? null : metricKey);
    
    if (!isAlreadySelected) {
      // Determine if this is a shared button (first 4) or step-specific button (5th)
      const isSharedButton = ["final_value", "total_return", "volatility", "sharpe_ratio"].includes(metricKey);
      const isStepSpecificButton = metricKey === "portfolio_chart";
      
      // Generate step-specific key for step buttons
      const stepSpecificKey = isStepSpecificButton ? `${metricKey}_${currentMessage.id}` : metricKey;
      
      // Check if first view based on button type
      const isFirstView = isSharedButton 
        ? !viewedSharedButtons.has(metricKey)
        : !viewedStepButtons.has(stepSpecificKey);
      
      if (isFirstView) {
        setSessionXp(prev => prev + 5);
        setShowXpAnimation(true);
        
        // Update appropriate viewed set
        if (isSharedButton) {
          setViewedSharedButtons(prev => new Set([...prev, metricKey]));
        } else {
          setViewedStepButtons(prev => new Set([...prev, stepSpecificKey]));
        }
        
        // Call XP callback if provided
        if (onXpEarned) {
          onXpEarned(5);
        }
        
        // Reset XP animation after delay
        setTimeout(() => setShowXpAnimation(false), 1500);
      }
      
      // Generate AI explanation for the selected metric
      const explanation = await generateMetricExplanation(metricKey, targetMetric);
      
      // Start typing effect for coach response
      setIsCoachTyping(true);
      setCoachTypingText("");
      typeCoachMessage(explanation);
    } else {
      setMetricExplanation("");
      setCoachTypingText("");
      setIsCoachTyping(false);
    }
  };

  // Coach typing effect
  const typeCoachMessage = (message: string) => {
    let currentIndex = 0;
    setCoachTypingText("");
    
    const typeNextChar = () => {
      if (currentIndex < message.length) {
        setCoachTypingText(message.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, 20); // Faster typing for coach
      } else {
        setIsCoachTyping(false);
        setMetricExplanation(message); // Set final message
      }
    };
    
    typeNextChar();
  };

  const handleMetricHover = (metricKey: string | null) => {
    setHoveredMetric(metricKey);
  };

  // Generate AI explanation based on metric and current data
  const generateMetricExplanation = async (metricKey: string, targetMetric: string): Promise<string> => {
    if (!aiCoachAdvice) return "Loading explanation...";
    
    const metricValue = getMetricValue(targetMetric);
    
    switch (metricKey) {
      case "final_value":
        return `Your final investment value is $${Math.round(finalAmount).toLocaleString()}. ${performance === "profit" ? 
          `Congratulations! Your investment grew by ${actualReturn.toFixed(2)}%. ${aiCoachAdvice.encouragement}` : 
          `Though your investment declined by ${Math.abs(actualReturn).toFixed(2)}%, this is valuable learning experience. ${aiCoachAdvice.recommendations[0] || "Remember, investing is a long-term game."}`}`;
        
      case "total_return":
        return `Your total return is ${actualReturn.toFixed(2)}%. This is a ${Math.abs(actualReturn) > 20 ? 
          "significant" : "moderate"} ${performance === "profit" ? "gain" : "loss"}. ${aiCoachAdvice.risk_assessment} ${aiCoachAdvice.recommendations[1] || ""}`;
        
      case "volatility":
        const volatility = realMetrics ? realMetrics.volatility : 16.26;
        return `Volatility is ${volatility.toFixed(2)}%, showing your investment's price movement range. ${volatility > 20 ? 
          "This is high volatility, meaning greater risk and potential returns." : "This is relatively stable investment."} ${aiCoachAdvice.recommendations[2] || "Balancing risk and return is key."}`;
        
      case "sharpe_ratio":
        const sharpe = realMetrics ? realMetrics.sharpe_ratio : 0.1;
        return `Sharpe ratio is ${sharpe.toFixed(2)}, measuring risk-adjusted returns. ${sharpe > 1 ? 
          "Excellent risk-adjusted performance!" : sharpe > 0 ? "Reasonable risk-return balance." : "Consider reviewing your risk-return ratio."} ${aiCoachAdvice.next_steps[0] || ""}`;
        
      case "portfolio_chart":
        return `This chart shows your investment journey over time. ${performance === "profit" ? 
          `You can see how your portfolio grew from the initial investment to $${Math.round(finalAmount).toLocaleString()}.` : 
          `The chart reveals the challenges during ${event.title}, helping you understand market timing impacts.`} ${aiCoachAdvice.recommendations[0] || "Track your performance by year to spot trends and patterns."}`;
        
      default:
        return aiCoachAdvice.advice;
    }
  };

  // Get metric value helper
  const getMetricValue = (targetMetric: string) => {
    switch (targetMetric) {
      case "final_value": return finalAmount;
      case "total_return": return actualReturn;
      case "volatility": return realMetrics ? realMetrics.volatility : 16.26;
      case "sharpe_ratio": return realMetrics ? realMetrics.sharpe_ratio : 0.1;
      default: return 0;
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMetricsCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number,
    colorClass?: string
  ) => (
    <Card className="text-center p-4">
      <div className="flex flex-col items-center gap-2">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-xl font-bold ${colorClass || ""}`}>
            {loadingMetrics ? "Loading..." : value}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderMarkdownComponents = {
    p: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-blue-800" {...props}>
        {children}
      </strong>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-1 mt-2" {...props}>
        {children}
      </ul>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-700" {...props}>
        {children}
      </li>
    ),
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state while fetching AI advice
  if (loadingAiAdvice && messages.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* Coach Header */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="relative w-20 h-20 shrink-0">
            {/* Simple glow effect based on performance */}
            <div
              className={`absolute -inset-1 rounded-full ${
                performance === "profit"
                  ? "bg-green-400/20"
                  : "bg-orange-400/20"
              } animate-pulse`}
            ></div>
            <Image
              src={coach.animatedAvatar}
              alt={coach.name}
              fill
              sizes="80px"
              className="rounded-full object-cover border-2 border-white shadow-lg relative z-10"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{coach.name}</h3>
              <Badge variant="secondary" className={coach.color}>
                {coach.personality}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{coach.description}</p>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-gray-700">
              <p className="font-medium text-lg">
                Getting personalized advice from {coach.name}...
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Analyzing your investment decision and preparing insights
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMessage = messages[currentMessageIndex];
  if (!currentMessage) return null;
  const extraMetricButton =
    currentMessage.metricButtons && currentMessage.metricButtons.length > 4
      ? currentMessage.metricButtons[4]
      : undefined;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Coach Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="relative w-20 h-20 shrink-0">
          {/* Simple glow effect based on performance */}
          <div
            className={`absolute -inset-1 rounded-full ${
              performance === "profit" ? "bg-green-400/20" : "bg-orange-400/20"
            } animate-pulse`}
          ></div>
          <Image
            src={
              isTyping || !showContinue ? coach.animatedAvatar : coach.avatar
            }
            alt={coach.name}
            fill
            sizes="80px"
            className="rounded-full object-cover border-2 border-white shadow-lg relative z-10"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{coach.name}</h3>
            <Badge variant="secondary" className={coach.color}>
              {coach.personality}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{coach.description}</p>
        </div>
      </div>

      {/* Coach Explanation in Chat Bubble - Simplified */}
      {selectedMetric && (isCoachTyping || metricExplanation) && (
        <div className="mb-4 relative">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm relative animate-in slide-in-from-bottom-2 duration-300">
            {/* Chat bubble pointer pointing to coach header */}
            <div className="absolute -top-2 left-20 w-4 h-4 bg-white border-l-2 border-t-2 border-blue-200 transform rotate-45"></div>
            
            {/* Simplified content - no redundant coach info */}
            <div className="text-sm text-gray-700 leading-relaxed">
              {isCoachTyping ? (
                <>
                  {coachTypingText}
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                </>
              ) : (
                metricExplanation
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Metric Buttons with merged prompt */}
      {currentMessage.metricButtons && (
        <div className="mb-4 pt-4 border-t border-blue-200 relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">💡 Ask {coach.name} about your results:</p>
            
            {/* XP Animation - Absolute positioned for stability */}
            {showXpAnimation && (
              <div className="absolute top-0 right-0 z-10">
                <div className="text-yellow-600 font-bold text-lg animate-bounce-slide-up">
                  +5 XP
                </div>
                {/* Sparkle effects */}
                <div className="absolute -inset-4 pointer-events-none">
                  <div className="absolute top-0 left-0 w-2 h-2 text-yellow-400 animate-sparkle-1">✨</div>
                  <div className="absolute top-1 right-0 w-2 h-2 text-yellow-300 animate-sparkle-2">⭐</div>
                  <div className="absolute -top-1 left-3 w-2 h-2 text-amber-400 animate-sparkle-3">✦</div>
                  <div className="absolute bottom-0 left-1 w-2 h-2 text-yellow-500 animate-sparkle-4">✨</div>
                  <div className="absolute bottom-1 right-2 w-2 h-2 text-amber-300 animate-sparkle-5">⭐</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Metric buttons - first row (4 buttons) - Cloud bubble style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {currentMessage.metricButtons.slice(0, 4).map((button) => {
              const isViewed = viewedSharedButtons.has(button.key);
              return (
                <button
                  key={button.key}
                  className={`relative px-4 py-2 min-h-[50px] rounded-2xl border transition-all duration-200 ${
                    hoveredMetric === button.key ? "shadow-md scale-105" : ""
                  } ${
                    selectedMetric === button.key
                      ? "bg-gradient-to-r from-indigo-400 to-purple-500 text-white border-indigo-500 shadow-lg"
                      : isViewed
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border-emerald-200 hover:from-green-100 hover:to-emerald-100"
                      : "bg-gradient-to-r from-sky-50 to-blue-50 text-blue-700 border-blue-200 hover:from-sky-100 hover:to-blue-100"
                  } ${isCoachTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => !isCoachTyping && handleMetricClick(button.key, button.targetMetric)}
                  onMouseEnter={() => !isCoachTyping && handleMetricHover(button.key)}
                  onMouseLeave={() => !isCoachTyping && handleMetricHover(null)}
                  disabled={isCoachTyping}
                >
                  {/* Cloud bubble pointer */}
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 ${
                    selectedMetric === button.key
                      ? "bg-gradient-to-r from-indigo-400 to-purple-500 border-r border-b border-indigo-500"
                      : isViewed
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-r border-b border-emerald-200"
                      : "bg-gradient-to-r from-sky-50 to-blue-50 border-r border-b border-blue-200"
                  }`}></div>
                  
                  <div className="flex items-center gap-2 justify-center">
                    {React.cloneElement(button.icon, {
                      className: `h-4 w-4 ${
                        selectedMetric === button.key
                          ? "text-white"
                          : isViewed
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }`,
                    })}
                    <span className="text-xs font-medium">{button.label}</span>
                    {isViewed && <span className="text-xs">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Chart-specific button - second row - Cloud bubble style */}
          {extraMetricButton && (
            <div className="flex justify-center mb-3">
              {(() => {
                const stepSpecificKey = `${extraMetricButton.key}_${currentMessage.id}`;
                const isViewed = viewedStepButtons.has(stepSpecificKey);
                return (
                  <button
                    key={extraMetricButton.key}
                    className={`relative px-6 py-3 min-h-[50px] rounded-2xl border transition-all duration-200 ${
                      hoveredMetric === extraMetricButton.key ? "shadow-md scale-105" : ""
                    } ${
                      selectedMetric === extraMetricButton.key
                        ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-purple-500 shadow-lg"
                        : isViewed
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border-emerald-200 hover:from-green-100 hover:to-emerald-100"
                        : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                    } ${isCoachTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !isCoachTyping && handleMetricClick(extraMetricButton.key, extraMetricButton.targetMetric)}
                    onMouseEnter={() => !isCoachTyping && handleMetricHover(extraMetricButton.key)}
                    onMouseLeave={() => !isCoachTyping && handleMetricHover(null)}
                    disabled={isCoachTyping}
                  >
                    {/* Cloud bubble pointer */}
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 ${
                      selectedMetric === extraMetricButton.key
                        ? "bg-gradient-to-r from-purple-400 to-pink-500 border-r border-b border-purple-500"
                        : isViewed
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-r border-b border-emerald-200"
                        : "bg-gradient-to-r from-purple-50 to-pink-50 border-r border-b border-purple-200"
                    }`}></div>
                    
                    <div className="flex items-center gap-2 justify-center">
                      {React.cloneElement(extraMetricButton.icon, {
                        className: `h-4 w-4 ${
                          selectedMetric === extraMetricButton.key
                            ? "text-white"
                            : isViewed
                            ? "text-emerald-600"
                            : "text-purple-600"
                        }`,
                      })}
                      <span className="text-xs font-medium">
                        {currentMessage.id === "portfolio_performance" && "Portfolio Performance (Annual)"}
                        {currentMessage.id === "annual_returns" && "Annual Returns Chart"}
                        {currentMessage.id === "risk_completion" && "Risk Analysis Chart"}
                      </span>
                      {isViewed && <span className="text-xs">✓</span>}
                    </div>
                  </button>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Display - REMOVED, now handled by PerformanceChart */}
      {/* Performance Chart - Show progressively */}
      {(currentMessage.showChart ||
        currentMessage.showReturnsChart ||
        currentMessage.showAnalysis) && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-800">
            Portfolio Performance Over Time
          </h4>
          <Card className="p-4">
            <PerformanceChart
              data={
                realMetrics?.chart_data?.map((item) => ({
                  date: item.date,
                  value: item.portfolio_value,
                })) ||
                simulationResult?.performance_chart?.dates?.map(
                  (date: string, index: number) => ({
                    date: date,
                    value: simulationResult.performance_chart.values[index],
                  })
                ) ||
                []
              }
              initialValue={100000}
              finalValue={realMetrics?.final_value || finalAmount}
              totalReturn={realMetrics?.total_return || actualReturn}
              volatility={realMetrics ? realMetrics.volatility / 100 : 0.1626}
              sharpeRatio={realMetrics ? realMetrics.sharpe_ratio : 0.1}
              maxDrawdown={
                realMetrics ? realMetrics.max_drawdown / 100 : -0.1956
              }
              showMetrics={currentMessage.showMetrics} // Now show metrics here
              showPortfolioChart={currentMessage.showChart}
              showReturnsChart={currentMessage.showReturnsChart}
              showRiskAnalysis={currentMessage.showAnalysis}
              highlightedMetric={hoveredMetric} // Pass hover state for highlighting
            />
          </Card>
        </div>
      )}

      {/* Risk Analysis - REMOVED to avoid duplication with PerformanceChart */}
      {/* Action Buttons */}
      <div className="flex justify-between">
        {/* Back Button - only show after step 1 */}
        {currentMessageIndex > 0 && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isCoachTyping}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
        )}
        
        {/* Spacer when no back button */}
        {currentMessageIndex === 0 && <div />}
        
        {/* Continue/Complete Buttons */}
        <div className="flex gap-2">
          {currentMessage.showComplete ? (
            <Button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              disabled={isCoachTyping}
            >
              <Trophy className="h-4 w-4" />
              Complete Mission
            </Button>
          ) : (
            <Button
              onClick={handleContinue}
              className="flex items-center gap-2"
              disabled={isCoachTyping || !showContinue}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-6">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-2">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentMessageIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentMessageIndex + 1} of {messages.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {currentMessage.id === "portfolio_performance" && "📈 Portfolio Performance"}
            {currentMessage.id === "annual_returns" && "📊 Annual Returns"}
            {currentMessage.id === "risk_analysis" && "⚖️ Risk Analysis"}
            {currentMessage.id === "summary_completion" && "🎉 Mission Summary"}
          </p>
        </div>
      </div>
    </div>
  );
}
