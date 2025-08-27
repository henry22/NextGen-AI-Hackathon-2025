import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AICoach } from "@/components/data/coaches";

interface CoachSidebarProps {
  coaches: AICoach[];
  selectedCoach: AICoach;
  onCoachSelect: (coach: AICoach) => void;
}

export function CoachSidebar({ coaches, selectedCoach, onCoachSelect }: CoachSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Users className="h-5 w-5" />
          AI Coach Team
        </CardTitle>
        <CardDescription>Choose your investment mentor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedCoach.id === coach.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
            onClick={() => onCoachSelect(coach)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{coach.avatar}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{coach.name}</p>
                <p className="text-xs text-muted-foreground">
                  {coach.personality}
                </p>
              </div>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              {coach.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}