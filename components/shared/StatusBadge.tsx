import React from "react";
import { Badge } from "@/components/ui/badge";

export type StatusType = 
  | "completed" 
  | "available" 
  | "locked" 
  | "beginner" 
  | "intermediate" 
  | "advanced" 
  | "expert"
  | "special";

interface StatusBadgeProps {
  status: StatusType;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return { text: "Completed", variant: "default" as const, className: "bg-green-100 text-green-800" };
      case "available":
        return { text: "Available", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" };
      case "locked":
        return { text: "Locked", variant: "outline" as const, className: "bg-gray-100 text-gray-600" };
      case "beginner":
        return { text: "Beginner", variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" };
      case "intermediate":
        return { text: "Intermediate", variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" };
      case "advanced":
        return { text: "Advanced", variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" };
      case "expert":
        return { text: "Expert", variant: "outline" as const, className: "bg-red-50 text-red-700 border-red-200" };
      case "special":
        return { text: "Special Challenge", variant: "default" as const, className: "bg-yellow-500 text-white" };
      default:
        return { text: status, variant: "outline" as const, className: "" };
    }
  };

  const { text, variant: defaultVariant, className: defaultClassName } = getStatusConfig();

  return (
    <Badge 
      variant={variant || defaultVariant} 
      className={`${defaultClassName} ${className || ""}`}
    >
      {text}
    </Badge>
  );
}