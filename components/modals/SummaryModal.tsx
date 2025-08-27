import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricsGrid, MetricItem } from "@/components/shared/MetricsGrid";
import {
  Trophy,
  CheckCircle,
  BarChart3,
  DollarSign,
  BookOpen,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { FinancialEvent } from "@/components/data/events";

interface LearningStats {
  totalMissions: number;
  completedCount: number;
  totalXPEarned: number;
  averageScore: number;
  completionRate: number;
}

interface SummaryModalProps {
  open: boolean;
  playerXP: number;
  totalScore: number;
  events: FinancialEvent[];
  onClose: () => void;
  onRestart: () => void;
}

export function SummaryModal({
  open,
  playerXP,
  totalScore,
  events,
  onClose,
  onRestart,
}: SummaryModalProps) {
  const calculateLearningStats = (): LearningStats => {
    const totalMissions = events.length;
    const completedCount = events.filter((e) => e.completed).length;
    const totalXPEarned = playerXP;
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

    return {
      totalMissions,
      completedCount,
      totalXPEarned,
      averageScore,
      completionRate: Math.round((completedCount / totalMissions) * 100),
    };
  };

  const generateLearningInsights = () => {
    const insights = [];
    const stats = calculateLearningStats();

    if (stats.averageScore >= 200) {
      insights.push(
        "🎯 Investment Decision Expert: You made wise investment choices in most missions!"
      );
    } else if (stats.averageScore >= 150) {
      insights.push("📈 Steady Investor: You demonstrated good risk control abilities.");
    } else {
      insights.push(
        "🌱 Learning Grower: Every failure is a valuable learning experience, keep going!"
      );
    }

    if (playerXP >= 1000) {
      insights.push(
        "🏆 Financial Knowledge Master: You have mastered rich financial history knowledge!"
      );
    }

    insights.push(
      "💡 Risk Management: Learned to assess investment risks in different market environments"
    );
    insights.push(
      "📊 Historical Insights: Understood the causes and impact patterns of financial crises"
    );
    insights.push(
      "🎓 Investment Strategy: Mastered the importance of diversified investing and asset allocation"
    );

    return insights;
  };

  const stats = calculateLearningStats();

  const summaryMetrics: MetricItem[] = [
    {
      id: "completed",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: "Completed Missions",
      value: stats.completedCount,
    },
    {
      id: "xp",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      title: "Total XP",
      value: playerXP,
    },
    {
      id: "average",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      title: "Average Score",
      value: stats.averageScore,
    },
    {
      id: "completion",
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-center flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Congratulations! Learning Mission Complete
            <Trophy className="h-8 w-8 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            You have successfully travelled through the important moments of financial
            history. It's time to review your learning achievements!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Banner */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎓</div>
                <h3 className="font-serif text-2xl font-bold">
                  Time-Travel Investment Master
                </h3>
                <p className="text-muted-foreground">
                  You have mastered the important financial events from 1990 to 2025,
                  becoming a true investment time traveller!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Learning Statistics */}
          <MetricsGrid metrics={summaryMetrics} columns={4} />

          {/* Learning Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Learning Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generateLearningInsights().map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="text-lg">{insight.split(" ")[0]}</div>
                    <p className="text-sm flex-1">
                      {insight.substring(insight.indexOf(" ") + 1)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mission Timeline Review */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Time-Travel Journey Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.year}
                    className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {event.year} - {event.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Earned {event.reward} XP
                      </p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Learning Points */}
          <Card className="bg-accent/10">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Learning Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">💰 Investment Principles</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Diversify investments to reduce risk</li>
                    <li>• Long-term investing beats short-term speculation</li>
                    <li>• Stay calm and rational during crises</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📈 Market Insights</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Bubbles always burst</li>
                    <li>• Crises create investment opportunities</li>
                    <li>• History repeats but never exactly the same</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Next Learning Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  🎯 <strong>Practical Application:</strong> Start with small investments
                  and apply your knowledge to real life
                </p>
                <p className="text-sm">
                  📚 <strong>Deep Learning:</strong> Read more financial books to
                  understand investment theory
                </p>
                <p className="text-sm">
                  🌐 <strong>Stay Informed:</strong> Follow current market trends and
                  develop investment sensitivity
                </p>
                <p className="text-sm">
                  👥 <strong>Share & Discuss:</strong> Share your financial knowledge
                  with friends and family
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={onClose} className="flex-1 font-medium">
              <Trophy className="h-4 w-4 mr-2" />
              Save Learning Results
            </Button>
            <Button variant="outline" onClick={onRestart}>
              Restart Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}