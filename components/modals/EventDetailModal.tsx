import React from "react";
import Image from "next/image";
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
import { Trophy, BookOpen, Play, Target } from "lucide-react";
import { FinancialEvent } from "@/components/data/events";
import { AICoach } from "@/components/data/coaches";
import { Badge } from "@/components/ui/badge";

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
  onStartMission,
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
      <DialogContent className="max-w-2xl h-dvh overflow-y-scroll">
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

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Image
                      src={selectedCoach.avatar}
                      alt={selectedCoach.name}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-primary/20 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Target className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <h4 className="font-bold text-lg">
                        {selectedCoach.name}
                      </h4>
                      <Badge className="text-primary bg-primary/10">
                        {selectedCoach.personality}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedCoach.description}
                    </p>
                  </div>
                  <div className="bg-accent/10 pl-4 pr-3 py-3 rounded-md border-l-2 border-accent/30 -ml-4">
                    <p className="text-sm">
                      <span className="font-semibold text-accent-foreground flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4" />
                        Recommended Strategy:
                      </span>
                      <span className="text-muted-foreground">
                        {getCoachStrategy()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
