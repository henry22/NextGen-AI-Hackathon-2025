"use client";

import { useRouter } from "next/navigation";
import InvestmentCompetition from "@/components/investment-competition";

export default function CompetitionPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/timeline');
  };

  const handleStartTrading = (portfolio: any, coach: any) => {
    // Encode portfolio and coach data as URL parameters
    const portfolioParam = encodeURIComponent(JSON.stringify(portfolio));
    const coachParam = encodeURIComponent(JSON.stringify(coach));
    
    router.push(`/competition/trading?portfolio=${portfolioParam}&coach=${coachParam}`);
  };

  return (
    <InvestmentCompetition
      onBack={handleBack}
      onStartTrading={handleStartTrading}
    />
  );
}