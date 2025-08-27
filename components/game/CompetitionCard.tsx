import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Trophy } from "lucide-react";

interface CompetitionCardProps {
  unlocked: boolean;
  onStartCompetition: () => void;
}

export function CompetitionCard({ unlocked, onStartCompetition }: CompetitionCardProps) {
  if (!unlocked) return null;

  return (
    <div className="relative flex items-start gap-6">
      {/* Competition Node */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400 text-white">
        <Trophy className="h-6 w-6" />
      </div>

      {/* Competition Card */}
      <div className="flex-1">
        <Card className="border-2 border-yellow-400/50 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg text-yellow-700 dark:text-yellow-300">
                  Investment Competition
                </CardTitle>
                <CardDescription className="font-medium text-orange-600 dark:text-orange-400 mt-1">
                  Special Challenge
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <StatusBadge 
                  status="special"
                  className="bg-yellow-500 text-white"
                />
                <StatusBadge
                  status="expert"
                  variant="outline"
                  className="border-orange-400 text-orange-600"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Congratulations on completing all historical challenges! Now join 
              the investment competition and compete with other players to showcase 
              your investment skills!
            </p>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Competition Features
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Real-time market data simulation</li>
                <li>• Compete with global players ranking</li>
                <li>• Rich rewards and achievement system</li>
                <li>• Advanced investment strategy challenges</li>
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  Unlimited XP Potential
                </span>
              </div>
              <Button
                size="sm"
                className="font-medium bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                onClick={onStartCompetition}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Start Competition
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}