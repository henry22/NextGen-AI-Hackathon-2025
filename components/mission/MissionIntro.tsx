import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, DollarSign, ArrowRight } from "lucide-react";
import { MissionData } from "@/components/data/missions";
import { AICoach } from "@/components/data/coaches";

interface MissionIntroProps {
  missionData: MissionData;
  selectedCoach: AICoach;
  onNext: () => void;
  onExit: () => void;
}

export function MissionIntro({
  missionData,
  selectedCoach,
  onNext,
  onExit,
}: MissionIntroProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Historical Background
          </h4>
          <p className="text-sm leading-relaxed">{missionData.context}</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Investment Situation
          </h4>
          <p className="text-sm leading-relaxed">{missionData.situation}</p>
        </CardContent>
      </Card>

      <Card className="bg-accent/10">
        <CardContent className="pt-6">
          <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
            <Image
              src={selectedCoach.avatar}
              alt={selectedCoach.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            {selectedCoach.name}'s Advice
          </h4>
          <p className="text-sm leading-relaxed">
            {missionData.coachAdvice[selectedCoach.id] ||
              "No specific advice available."}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={onNext} className="flex-1 font-medium">
          <ArrowRight className="h-4 w-4 mr-2" />
          Start Investment Decision
        </Button>
        <Button variant="outline" onClick={onExit}>
          Exit Mission
        </Button>
      </div>
    </div>
  );
}
