import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusType } from "@/components/shared/StatusBadge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trophy, 
  Play, 
  AlertTriangle 
} from "lucide-react";
import { FinancialEvent } from "@/components/data/events";

interface EventCardProps {
  event: FinancialEvent;
  onEventClick: (event: FinancialEvent) => void;
}

export function EventCard({ event, onEventClick }: EventCardProps) {
  const getImpactIcon = () => {
    switch (event.impact) {
      case "negative":
        return <TrendingDown className="h-6 w-6" />;
      case "mixed":
        return <DollarSign className="h-6 w-6" />;
      default:
        return <TrendingUp className="h-6 w-6" />;
    }
  };

  const getNodeStyle = () => {
    if (event.completed) {
      return "bg-primary border-primary text-primary-foreground";
    }
    if (event.unlocked) {
      return "bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer";
    }
    return "bg-muted border-muted-foreground text-muted-foreground";
  };

  return (
    <div className="relative flex items-start gap-6">
      {/* Timeline Node */}
      <div
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 ${getNodeStyle()} transition-all duration-300`}
        onClick={() => onEventClick(event)}
      >
        {event.completed ? (
          <Trophy className="h-6 w-6" />
        ) : (
          getImpactIcon()
        )}
      </div>

      {/* Event Card */}
      <div className={`flex-1 ${!event.unlocked ? "opacity-50" : ""}`}>
        <Card
          className={`transition-all duration-300 ${
            event.unlocked ? "hover:shadow-md cursor-pointer" : ""
          }`}
          onClick={() => onEventClick(event)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg">
                  {event.year}
                </CardTitle>
                <CardDescription className="font-medium text-foreground mt-1">
                  {event.title}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <StatusBadge
                  status={
                    event.completed 
                      ? "completed" 
                      : event.unlocked 
                        ? "available" 
                        : "locked"
                  }
                />
                <StatusBadge status={event.difficulty as StatusType} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {event.description}
            </p>
            {!event.unlocked && event.unlockDescription && (
              <div className="mb-3 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {event.unlockDescription}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{event.reward} XP</span>
              </div>
              {event.unlocked && !event.completed && (
                <Button 
                  size="sm" 
                  className="font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Mission
                </Button>
              )}
              {!event.unlocked && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="font-medium bg-transparent"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Locked
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}