import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GameHeaderProps {
  playerLevel: number;
  playerXP: number;
  totalScore: number;
}

export function GameHeader({ playerLevel, playerXP, totalScore }: GameHeaderProps) {
  const xpToNextLevel = 1000;
  const xpProgress = ((playerXP % xpToNextLevel) / xpToNextLevel) * 100;
  
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-black text-primary">
              Legacy Guardians
            </h1>
            <p className="text-sm text-muted-foreground">
              Time-Warp Wealth Adventure
            </p>
          </div>
          <div className="flex items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center px-4 py-3 bg-muted rounded-lg min-w-[80px] cursor-help">
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="text-xl font-bold text-primary">{playerLevel}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Experience: {playerXP}/{xpToNextLevel} XP</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="text-center px-4 py-3 bg-muted rounded-lg min-w-[100px]">
              <p className="text-xs text-muted-foreground">Total Score</p>
              <p className="text-xl font-bold text-primary">{totalScore}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}