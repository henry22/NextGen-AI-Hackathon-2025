import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, BarChart3 } from "lucide-react";
import { InvestmentOption } from "@/components/data/missions";

interface InvestmentDecisionProps {
  options: InvestmentOption[];
  selectedInvestment: string | null;
  onInvestmentSelect: (optionId: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function InvestmentDecision({ 
  options, 
  selectedInvestment, 
  onInvestmentSelect, 
  onConfirm, 
  onBack 
}: InvestmentDecisionProps) {
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "extreme":
        return "destructive" as const;
      case "high":
        return "secondary" as const;
      case "medium":
        return "outline" as const;
      case "low":
        return "default" as const;
      case "none":
        return "default" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedInvestment === option.id
                ? "border-primary bg-primary/5"
                : ""
            }`}
            onClick={() => onInvestmentSelect(option.id)}
          >
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{option.name}</h4>
                  <Badge variant={getRiskBadgeVariant(option.risk)}>
                    {option.risk} Risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Expected Return: {option.expectedReturn}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onConfirm}
          disabled={!selectedInvestment}
          className="flex-1 font-medium"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Confirm Investment
        </Button>
        <Button variant="outline" onClick={onBack}>
          Reconsider
        </Button>
      </div>
    </div>
  );
}