"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CompetitionResults from "@/components/competition-results";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resultsData, setResultsData] = useState<{
    finalValue: number;
    totalReturn: number;
  } | null>(null);

  useEffect(() => {
    const finalValueParam = searchParams.get('finalValue');
    const totalReturnParam = searchParams.get('totalReturn');

    if (finalValueParam && totalReturnParam) {
      try {
        const finalValue = parseFloat(finalValueParam);
        const totalReturn = parseFloat(totalReturnParam);
        
        if (!isNaN(finalValue) && !isNaN(totalReturn)) {
          setResultsData({ finalValue, totalReturn });
        } else {
          router.push('/competition');
        }
      } catch (error) {
        console.error('Failed to parse results data:', error);
        router.push('/competition');
      }
    } else {
      // Redirect to competition setup if no results data
      router.push('/competition');
    }
  }, [searchParams, router]);

  const handleBackToHome = () => {
    router.push('/timeline');
  };

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <CompetitionResults
      finalValue={resultsData.finalValue}
      totalReturn={resultsData.totalReturn}
      onBackToHome={handleBackToHome}
    />
  );
}