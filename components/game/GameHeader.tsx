import React from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GameHeaderProps {
  playerLevel: number;
  playerXP: number;
  totalScore: number;
}

export function GameHeader({
  playerLevel,
  playerXP,
  totalScore,
}: GameHeaderProps) {
  const xpToNextLevel = 1000;
  const xpProgress = ((playerXP % xpToNextLevel) / xpToNextLevel) * 100;

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="mx-auto max-w-[680px] lg:max-w-7xl px-4 py-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-primary flex items-center justify-center sm:justify-start gap-2">
              <Image
                src="/favicon.png"
                alt="NUVC Icon"
                width={48}
                height={48}
                className="object-contain w-8 h-8 sm:w-12 sm:h-12"
              />
              Legacy Guardians
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Time-Warp Wealth Adventure
            </p>
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-6 mt-2 sm:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center px-3 py-2 sm:px-4 sm:py-3 bg-muted rounded-lg min-w-[84px] sm:min-w-[100px] cursor-help">
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="text-lg sm:text-xl font-bold text-primary">
                      {playerLevel}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Experience: {playerXP}/{xpToNextLevel} XP
                  </p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="text-center px-3 py-2 sm:px-4 sm:py-3 bg-muted rounded-lg min-w-[84px] sm:min-w-[100px]">
              <p className="text-xs text-muted-foreground">Total Score</p>
              <p className="text-lg sm:text-xl font-bold text-primary">
                {totalScore}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
