import React from "react";

interface GameHeaderProps {
  playerLevel: number;
  playerXP: number;
  totalScore: number;
}

export function GameHeader({ playerLevel, playerXP, totalScore }: GameHeaderProps) {
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
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Level {playerLevel}</p>
              <p className="text-xs text-muted-foreground">{playerXP} XP</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Total Score</p>
              <p className="text-lg font-bold text-primary">{totalScore}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}