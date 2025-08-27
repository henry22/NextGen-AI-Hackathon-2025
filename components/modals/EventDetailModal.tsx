import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/shared/DataCard";
import { Trophy, BookOpen, Play } from "lucide-react";
import { FinancialEvent } from "@/components/data/events";
import { AICoach } from "@/components/data/coaches";

interface EventDetailModalProps {
  event: FinancialEvent | null;
  selectedCoach: AICoach;
  onClose: () => void;
  onStartMission: () => void;
}

export function EventDetailModal({ 
  event, 
  selectedCoach, 
  onClose, 
  onStartMission 
}: EventDetailModalProps) {
  if (!event) return null;

  const getCoachStrategy = () => {
    switch (selectedCoach.id) {
      case "steady-sam":
        return "Stay calm during crises and choose defensive assets like bonds and gold.";
      case "growth-guru":
        return "Balance risk and opportunity by diversifying across different asset classes.";
      case "adventure-alex":
        return "Crisis creates opportunity! Look for undervalued high-growth potential investments.";
      case "yield-yoda":
        return "Focus on investments that generate stable cash flow and let compound interest work for you.";
      default:
        return "Follow a balanced investment approach based on market conditions.";
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {event.year} - {event.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <DataCard
              icon={<Trophy className="h-8 w-8 text-accent" />}
              title="Reward XP"
              value={`${event.reward} XP`}
            />
            <DataCard
              icon={<BookOpen className="h-8 w-8 text-secondary" />}
              title="Difficulty Level"
              value={
                event.difficulty === "beginner"
                  ? "Beginner"
                  : event.difficulty === "intermediate"
                  ? "Intermediate"
                  : event.difficulty === "advanced"
                  ? "Advanced"
                  : "Expert"
              }
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-serif font-semibold mb-2">
              Your AI Coach: {selectedCoach.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedCoach.description}
            </p>
            <p className="text-sm">
              <span className="font-medium">Recommended Strategy: </span>
              {getCoachStrategy()}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={onStartMission} className="flex-1 font-medium">
              <Play className="h-4 w-4 mr-2" />
              Start Time Mission
            </Button>
            <Button variant="outline" onClick={onClose}>
              Challenge Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}