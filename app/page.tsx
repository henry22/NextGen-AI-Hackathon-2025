"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Game Logo and Title */}
          <div className="space-y-4">
            <h1 className="text-6xl font-serif font-black text-primary mb-2 flex items-center justify-center gap-2">
              <Image
                src="/favicon.png"
                alt="NUVC Icon"
                width={88}
                height={88}
                className="object-contain"
              />
              Legacy Guardians
            </h1>
            <p className="text-2xl font-medium text-muted-foreground">
              Time-Warp Wealth Adventure
            </p>
          </div>

          {/* Game Description */}
          <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-semibold text-foreground">
                Master Wealth Wisdom Through Time Travel
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Welcome to the financial history time adventure! You'll travel
                to key moments of major financial events, learn investment
                strategies with AI coaches, and experience real financial
                decisions in a risk-free environment.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <div className="h-6 w-6 text-green-600 text-xl">📈</div>
                  </div>
                  <h3 className="font-semibold mb-2">Learn Investing</h3>
                  <p className="text-sm text-muted-foreground">
                    Master risk management and asset allocation
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                    <div className="h-6 w-6 text-blue-600 text-xl">📚</div>
                  </div>
                  <h3 className="font-semibold mb-2">Historical Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand the causes and effects of financial crises
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                    <div className="h-6 w-6 text-purple-600 text-xl">🤖</div>
                  </div>
                  <h3 className="font-semibold mb-2">AI Coaches</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional coaches provide personalized guidance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <div className="text-center pt-8">
            <Link href="/timeline">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-4 font-semibold rounded-lg transition-colors">
                <Play className="inline-block h-6 w-6 mr-3" />
                Start Time Adventure
              </button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Ready to travel through time and become a wealth guardian?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
