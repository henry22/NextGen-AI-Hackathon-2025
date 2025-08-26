"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Heart,
} from "lucide-react";
import { api, CoachRequest, CoachResponse } from "@/lib/api";

interface AICoachProps {
  playerLevel: "beginner" | "intermediate" | "advanced";
  currentPortfolio: Record<string, number>;
  investmentGoal: "cash_flow" | "capital_gains" | "balanced";
  riskTolerance: number;
  completedMissions: string[];
  currentMission?: string;
  onAdviceReceived?: (advice: CoachResponse) => void;
}

const coachAvatars = {
  beginner: "🛡️",
  intermediate: "⚖️",
  advanced: "🚀",
};

const coachNames = {
  beginner: "Steady Sam",
  intermediate: "Growth Guru",
  advanced: "Adventure Alex",
};

const coachColors = {
  beginner: "bg-blue-100 text-blue-800 border-blue-200",
  intermediate: "bg-green-100 text-green-800 border-green-200",
  advanced: "bg-purple-100 text-purple-800 border-purple-200",
};

export function AICoach({
  playerLevel,
  currentPortfolio,
  investmentGoal,
  riskTolerance,
  completedMissions,
  currentMission,
  onAdviceReceived,
}: AICoachProps) {
  const [advice, setAdvice] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setLoading(true);
    setError(null);

    try {
      const request: CoachRequest = {
        player_level: playerLevel,
        current_portfolio: currentPortfolio,
        investment_goal: investmentGoal,
        risk_tolerance: riskTolerance,
        time_horizon: 365,
        completed_missions: completedMissions,
        current_mission: currentMission,
        player_context: `Player is working on ${
          currentMission || "general investment learning"
        } with a ${investmentGoal} focus.`,
      };

      const response = await api.getCoachAdvice(request);
      setAdvice(response);
      onAdviceReceived?.(response);
    } catch (err: any) {
      setError(err.message || "Failed to get coach advice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-2xl">
              {coachAvatars[playerLevel]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{coachNames[playerLevel]}</span>
              <Badge className={coachColors[playerLevel]}>
                {playerLevel.charAt(0).toUpperCase() + playerLevel.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Your AI investment coach for personalized guidance
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!advice && !loading && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Get personalized investment advice from your AI coach
            </p>
            <Button onClick={handleGetAdvice} className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Get Coach Advice
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Your AI coach is analyzing your portfolio...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetAdvice}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {advice && (
          <div className="space-y-6">
            {/* Main Advice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Coach's Advice
                  </h4>
                  <p className="text-blue-800">{advice.advice}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {advice.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {advice.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {advice.next_steps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  Next Steps
                </h4>
                <ul className="space-y-2">
                  {advice.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Risk Assessment
                  </h4>
                  <p className="text-orange-800 text-sm">
                    {advice.risk_assessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Educational Insights */}
            {advice.educational_insights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
                  Educational Insights
                </h4>
                <ul className="space-y-2">
                  {advice.educational_insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Heart className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">
                    Keep Going!
                  </h4>
                  <p className="text-green-800 text-sm">
                    {advice.encouragement}
                  </p>
                </div>
              </div>
            </div>

            {/* Get New Advice Button */}
            <Button
              onClick={handleGetAdvice}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Get New Advice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
