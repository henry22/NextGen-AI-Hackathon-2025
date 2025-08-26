"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Trophy,
  Play,
  BookOpen,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Financial events data
const financialEvents = [
  {
    year: 1990,
    title: "日本泡沫經濟破滅",
    description: "日本房地產和股市泡沫破滅，開始了失落的十年",
    impact: "negative",
    difficulty: "beginner",
    unlocked: true,
    completed: false,
    reward: 100,
    unlockRequirements: [],
  },
  {
    year: 1997,
    title: "亞洲金融風暴",
    description: "從泰國開始的金融危機席捲整個亞洲",
    impact: "negative",
    difficulty: "intermediate",
    unlocked: true,
    completed: false,
    reward: 150,
    unlockRequirements: [],
  },
  {
    year: 2000,
    title: "網路泡沫破滅",
    description: "科技股大幅下跌，納斯達克指數暴跌78%",
    impact: "negative",
    difficulty: "intermediate",
    unlocked: true,
    completed: false,
    reward: 150,
    unlockRequirements: [],
  },
  {
    year: 2008,
    title: "全球金融海嘯",
    description: "次貸危機引發全球金融體系崩潰",
    impact: "negative",
    difficulty: "advanced",
    unlocked: true,
    completed: false,
    reward: 200,
    unlockRequirements: [1997, 2000],
  },
  {
    year: 2020,
    title: "COVID-19 疫情衝擊",
    description: "全球疫情導致經濟停擺，股市劇烈波動",
    impact: "mixed",
    difficulty: "advanced",
    unlocked: false,
    completed: false,
    reward: 250,
    unlockRequirements: [2008],
    unlockDescription: "完成「2008 - 全球金融海嘯」任務後解鎖",
  },
  {
    year: 2025,
    title: "當前挑戰",
    description: "通膨、升息與地緣政治風險",
    impact: "mixed",
    difficulty: "expert",
    unlocked: false,
    completed: false,
    reward: 300,
    unlockRequirements: [2020],
    unlockDescription: "完成「2020 - COVID-19 疫情衝擊」任務後解鎖",
  },
];

// AI Coaches data
const aiCoaches = [
  {
    id: "steady-sam",
    name: "Steady Sam",
    personality: "保守型教練",
    description: "專精於債券、黃金和穩定投資策略",
    avatar: "🛡️",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "growth-guru",
    name: "Growth Guru",
    personality: "均衡型教練",
    description: "混合股票、ETF和REITs的平衡投資",
    avatar: "⚖️",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "adventure-alex",
    name: "Adventure Alex",
    personality: "進取型教練",
    description: "高風險高報酬的加密貨幣和成長股",
    avatar: "🚀",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "yield-yoda",
    name: "Yield Yoda",
    personality: "收益型教練",
    description: "專注於被動收益和複利效應",
    avatar: "💰",
    color: "bg-yellow-100 text-yellow-800",
  },
];

// Detailed mission data for each financial event
const missionData = {
  1990: {
    context:
      "1990年，日本經濟正處於泡沫的頂峰。東京的房地產價格飆升，日經指數創下歷史新高。然而，危機正在醞釀中...",
    situation:
      "你有 $100,000 的投資資金。市場上充滿樂觀情緒，但一些經濟學家開始警告泡沫風險。",
    options: [
      {
        id: "stocks",
        name: "日本股票",
        description: "投資日經225指數基金",
        risk: "高",
        expectedReturn: "15-25%",
        actualReturn: -60,
      },
      {
        id: "realestate",
        name: "東京房地產",
        description: "購買東京市中心公寓",
        risk: "高",
        expectedReturn: "20-30%",
        actualReturn: -70,
      },
      {
        id: "bonds",
        name: "美國國債",
        description: "購買10年期美國國債",
        risk: "低",
        expectedReturn: "8-10%",
        actualReturn: 45,
      },
      {
        id: "gold",
        name: "黃金",
        description: "投資實體黃金",
        risk: "中",
        expectedReturn: "5-8%",
        actualReturn: 20,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "我建議分散投資，將大部分資金投入美國國債和黃金。日本市場風險太高了。",
      "growth-guru":
        "可以小額投資日本市場，但要保持平衡，建議40%債券、30%股票、30%黃金。",
      "adventure-alex":
        "這是千載難逢的機會！全力投資日本股票和房地產，風險越大收益越大！",
      "yield-yoda":
        "專注於能產生穩定收益的資產。美國國債雖然收益不高，但在動盪時期最安全。",
    },
    outcome:
      "1991年，日本央行開始升息，泡沫破滅。股市和房地產價格暴跌，開始了「失落的十年」。",
  },
  1997: {
    context:
      "1997年7月，泰國政府宣布放棄泰銖與美元的固定匯率制度。這個決定如骨牌效應般席捲整個亞洲，引發了史上最嚴重的區域性金融危機之一...",
    situation:
      "你有 $100,000 的投資資金。亞洲各國貨幣開始貶值，股市暴跌，但也創造了投資機會。",
    options: [
      {
        id: "asian-stocks",
        name: "亞洲股票",
        description: "投資韓國、泰國、印尼股市",
        risk: "極高",
        expectedReturn: "30-50%",
        actualReturn: -65,
      },
      {
        id: "us-stocks",
        name: "美國股票",
        description: "投資標普500指數基金",
        risk: "中",
        expectedReturn: "12-18%",
        actualReturn: 28,
      },
      {
        id: "bonds",
        name: "美國國債",
        description: "購買10年期美國國債",
        risk: "低",
        expectedReturn: "6-8%",
        actualReturn: 15,
      },
      {
        id: "cash",
        name: "美元現金",
        description: "持有美元等待機會",
        risk: "無",
        expectedReturn: "4-5%",
        actualReturn: 8,
      },
    ],
    coachAdvice: {
      "steady-sam": "亞洲市場太危險了！建議持有美國國債和現金，等待風暴過去。",
      "growth-guru":
        "可以適度投資美國股市，但要避開亞洲市場。建議60%美股、40%債券。",
      "adventure-alex": "危機就是轉機！亞洲股票現在超便宜，是抄底的好時機！",
      "yield-yoda": "在不確定時期，現金為王。保持流動性，等待更好的投資機會。",
    },
    outcome:
      "亞洲金融風暴持續到1998年，多國貨幣貶值超過50%，股市跌幅達60-80%。美國市場相對穩定，成為資金避風港。",
  },
  2000: {
    context:
      "2000年，網路革命正在改變世界。科技股價格飆升，人們相信「新經濟」將永遠改變投資規則...",
    situation:
      "你有 $100,000 的投資資金。納斯達克指數在過去5年上漲了400%，科技公司估值達到天價。",
    options: [
      {
        id: "tech",
        name: "科技股",
        description: "投資納斯達克100指數",
        risk: "高",
        expectedReturn: "25-40%",
        actualReturn: -78,
      },
      {
        id: "dotcom",
        name: "網路新創",
        description: "投資.com公司股票",
        risk: "極高",
        expectedReturn: "50-100%",
        actualReturn: -95,
      },
      {
        id: "traditional",
        name: "傳統股票",
        description: "投資道瓊工業指數",
        risk: "中",
        expectedReturn: "10-15%",
        actualReturn: -25,
      },
      {
        id: "cash",
        name: "現金",
        description: "持有現金等待機會",
        risk: "無",
        expectedReturn: "3-5%",
        actualReturn: 15,
      },
    ],
    coachAdvice: {
      "steady-sam": "市場過熱了！建議持有現金，等待更好的進場時機。",
      "growth-guru":
        "可以適度參與科技股，但要控制比例，建議50%現金、30%傳統股票、20%科技股。",
      "adventure-alex":
        "網路革命才剛開始！全力投資.com公司，這是歷史性的機會！",
      "yield-yoda": "高估值意味著低未來報酬。保持耐心，現金為王。",
    },
    outcome:
      "2000年3月，網路泡沫破滅。納斯達克指數在接下來的兩年中下跌78%，許多.com公司倒閉。",
  },
  2008: {
    context:
      "2008年9月，雷曼兄弟宣布破產，引發全球金融海嘯。次級房貸危機從美國蔓延到全世界，銀行體系面臨崩潰...",
    situation:
      "你有 $100,000 的投資資金。全球股市暴跌，信貸市場凍結，但央行開始大規模救市。",
    options: [
      {
        id: "stocks",
        name: "全球股票",
        description: "投資MSCI世界指數",
        risk: "極高",
        expectedReturn: "20-30%",
        actualReturn: -55,
      },
      {
        id: "banks",
        name: "銀行股",
        description: "投資金融類股",
        risk: "極高",
        expectedReturn: "40-60%",
        actualReturn: -75,
      },
      {
        id: "bonds",
        name: "美國國債",
        description: "購買10年期美國國債",
        risk: "低",
        expectedReturn: "4-6%",
        actualReturn: 25,
      },
      {
        id: "gold",
        name: "黃金",
        description: "投資實體黃金",
        risk: "中",
        expectedReturn: "8-12%",
        actualReturn: 35,
      },
    ],
    coachAdvice: {
      "steady-sam":
        "這是百年一遇的危機！全力投資美國國債和黃金，遠離股票市場。",
      "growth-guru":
        "危機中要保持冷靜，建議70%債券、20%黃金、10%股票分批進場。",
      "adventure-alex": "股票現在超便宜！這是一生難得的抄底機會，全力買進！",
      "yield-yoda": "在恐慌中保持理性。國債和黃金是最安全的避風港。",
    },
    outcome:
      "2008-2009年，全球股市跌幅超過50%，但美國國債和黃金成為避險資產。各國央行大規模量化寬鬆，為後續復甦奠定基礎。",
  },
  2020: {
    context:
      "2020年3月，COVID-19疫情全球大流行，各國實施封鎖措施。股市在短短一個月內暴跌30%，但央行史無前例的刺激政策即將登場...",
    situation:
      "你有 $100,000 的投資資金。市場恐慌情緒達到頂點，但科技股開始展現韌性。",
    options: [
      {
        id: "tech-stocks",
        name: "科技股",
        description: "投資FAANG等科技巨頭",
        risk: "中",
        expectedReturn: "15-25%",
        actualReturn: 85,
      },
      {
        id: "travel-stocks",
        name: "旅遊航空股",
        description: "投資航空、郵輪、飯店股",
        risk: "極高",
        expectedReturn: "50-100%",
        actualReturn: -45,
      },
      {
        id: "bonds",
        name: "美國國債",
        description: "購買10年期美國國債",
        risk: "低",
        expectedReturn: "2-4%",
        actualReturn: 12,
      },
      {
        id: "gold",
        name: "黃金",
        description: "投資實體黃金",
        risk: "中",
        expectedReturn: "8-15%",
        actualReturn: 28,
      },
    ],
    coachAdvice: {
      "steady-sam": "疫情影響難以預測，建議投資國債和黃金等避險資產。",
      "growth-guru":
        "科技股受惠於數位轉型，可以適度配置。建議50%科技股、30%債券、20%黃金。",
      "adventure-alex": "旅遊股跌到谷底，疫情總會結束，現在是抄底的絕佳時機！",
      "yield-yoda": "專注於疫情受惠的產業，如科技、醫療、電商等。",
    },
    outcome:
      "2020年下半年，科技股大漲，疫苗問世後旅遊股反彈，但整體而言科技股表現最佳。央行大規模印鈔推升資產價格。",
  },
  2025: {
    context:
      "2025年，全球面臨通膨壓力、央行升息、地緣政治緊張等多重挑戰。AI革命正在改變產業格局，但市場波動加劇...",
    situation:
      "你有 $100,000 的投資資金。通膨仍在高位，利率處於多年高點，但AI和綠能產業展現強勁成長。",
    options: [
      {
        id: "ai-stocks",
        name: "AI科技股",
        description: "投資人工智慧相關公司",
        risk: "高",
        expectedReturn: "20-40%",
        actualReturn: 0, // 未來結果待定
      },
      {
        id: "energy",
        name: "綠能股",
        description: "投資太陽能、風能等綠色能源",
        risk: "高",
        expectedReturn: "15-30%",
        actualReturn: 0,
      },
      {
        id: "tips",
        name: "抗通膨債券",
        description: "購買通膨保護債券(TIPS)",
        risk: "低",
        expectedReturn: "5-8%",
        actualReturn: 0,
      },
      {
        id: "commodities",
        name: "大宗商品",
        description: "投資石油、黃金、農產品",
        risk: "中",
        expectedReturn: "10-20%",
        actualReturn: 0,
      },
    ],
    coachAdvice: {
      "steady-sam": "在不確定時期，建議投資抗通膨債券和大宗商品來保值。",
      "growth-guru":
        "AI是未來趋势，但要平衡風險。建議40%AI股、30%抗通膨債券、30%大宗商品。",
      "adventure-alex":
        "AI革命才剛開始！全力投資AI科技股，這是下一個十年的主題！",
      "yield-yoda": "通膨環境下，實體資產和抗通膨債券是最佳選擇。",
    },
    outcome:
      "這是當前正在發生的事件，結果尚未確定。你的投資決策將影響未來的財富累積！",
  },
};

export default function FinancialTimelineGame() {
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof financialEvents)[0] | null
  >(null);
  const [selectedCoach, setSelectedCoach] = useState(aiCoaches[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  // Mission game state management
  const [missionStep, setMissionStep] = useState<
    "intro" | "decision" | "result"
  >("intro");
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(
    null
  );
  const [missionResult, setMissionResult] = useState<any>(null);

  const updateUnlockStatus = () => {
    financialEvents.forEach((event) => {
      if (event.unlockRequirements.length > 0) {
        const allRequirementsMet = event.unlockRequirements.every(
          (requiredYear) => {
            const requiredEvent = financialEvents.find(
              (e) => e.year === requiredYear
            );
            return requiredEvent?.completed === true;
          }
        );
        event.unlocked = allRequirementsMet;
      }
    });
  };

  useEffect(() => {
    updateUnlockStatus();
  }, []);

  const handleEventClick = (event: (typeof financialEvents)[0]) => {
    if (event.unlocked) {
      setSelectedEvent(event);
    }
  };

  const startMission = () => {
    if (selectedEvent) {
      setGameStarted(true);
      setMissionStep("intro");
    }
  };

  const makeInvestment = (optionId: string) => {
    if (!selectedEvent) return;

    const mission = missionData[selectedEvent.year as keyof typeof missionData];
    const option = mission.options.find((opt) => opt.id === optionId);

    if (option) {
      setSelectedInvestment(optionId);
      setMissionResult({
        option,
        actualReturn: option.actualReturn,
        finalAmount: 100000 * (1 + option.actualReturn / 100),
        performance: option.actualReturn > 0 ? "profit" : "loss",
      });
      setMissionStep("result");
    }
  };

  const completeMission = () => {
    if (selectedEvent && missionResult) {
      const baseReward = selectedEvent.reward;
      const performanceBonus = missionResult.performance === "profit" ? 50 : 0;
      const totalReward = baseReward + performanceBonus;

      setPlayerXP((prev) => prev + totalReward);
      setTotalScore((prev) => prev + totalReward);

      setCompletedMissions((prev) => [...prev, selectedEvent.title]);

      const eventIndex = financialEvents.findIndex(
        (e) => e.year === selectedEvent.year
      );
      if (eventIndex !== -1) {
        financialEvents[eventIndex].completed = true;
        // Update unlock status for other events
        updateUnlockStatus();
      }

      setGameStarted(false);
      setSelectedEvent(null);
      setMissionStep("intro");
      setSelectedInvestment(null);
      setMissionResult(null);
    }
  };

  const allMissionsCompleted = financialEvents.every(
    (event) => event.completed
  );

  useEffect(() => {
    if (allMissionsCompleted && !showSummary) {
      setTimeout(() => setShowSummary(true), 1000);
    }
  }, [allMissionsCompleted, showSummary]);

  const calculateLearningStats = () => {
    const totalMissions = financialEvents.length;
    const completedCount = financialEvents.filter((e) => e.completed).length;
    const totalXPEarned = playerXP;
    const averageScore =
      completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

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
        "🎯 投資決策專家：你在大多數任務中都做出了明智的投資選擇！"
      );
    } else if (stats.averageScore >= 150) {
      insights.push("📈 穩健投資者：你展現了良好的風險控制能力。");
    } else {
      insights.push("🌱 學習成長者：每次失敗都是寶貴的學習經驗，繼續加油！");
    }

    if (playerXP >= 1000) {
      insights.push("🏆 金融知識達人：你已經掌握了豐富的金融歷史知識！");
    }

    insights.push("💡 風險管理：學會了在不同市場環境下評估投資風險");
    insights.push("📊 歷史洞察：了解了金融危機的成因和影響模式");
    insights.push("🎓 投資策略：掌握了多元化投資和資產配置的重要性");

    return insights;
  };

  const currentMission = selectedEvent
    ? missionData[selectedEvent.year as keyof typeof missionData]
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-black text-primary">
                Legacy Guardians
              </h1>
              <p className="text-sm text-muted-foreground">
                Time-Warp Wealth Adventure
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Level {playerLevel}</p>
                <p className="text-xs text-muted-foreground">{playerXP} XP</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">總分數</p>
                <p className="text-lg font-bold text-primary">{totalScore}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* AI Coaches Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  AI 教練團隊
                </CardTitle>
                <CardDescription>選擇你的投資導師</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCoach.id === coach.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCoach(coach)}
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

            {/* Progress Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  學習進度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>經驗值</span>
                      <span>{playerXP}/1000</span>
                    </div>
                    <Progress value={(playerXP / 1000) * 100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {financialEvents.filter((e) => e.completed).length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        已完成任務
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">
                        {financialEvents.filter((e) => e.unlocked).length}
                      </p>
                      <p className="text-xs text-muted-foreground">可用任務</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Timeline */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  金融歷史時間軸
                </CardTitle>
                <CardDescription>
                  穿越時空，體驗重大金融事件。點擊事件開始你的投資任務！
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

                  {/* Timeline Events */}
                  <div className="space-y-8">
                    {financialEvents.map((event, index) => (
                      <div
                        key={event.year}
                        className="relative flex items-start gap-6"
                      >
                        {/* Timeline Node */}
                        <div
                          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                            event.completed
                              ? "bg-primary border-primary text-primary-foreground"
                              : event.unlocked
                              ? "bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer"
                              : "bg-muted border-muted-foreground text-muted-foreground"
                          } transition-all duration-300`}
                          onClick={() => handleEventClick(event)}
                        >
                          {event.completed ? (
                            <Trophy className="h-6 w-6" />
                          ) : event.impact === "negative" ? (
                            <TrendingDown className="h-6 w-6" />
                          ) : event.impact === "mixed" ? (
                            <DollarSign className="h-6 w-6" />
                          ) : (
                            <TrendingUp className="h-6 w-6" />
                          )}
                        </div>

                        {/* Event Card */}
                        <div
                          className={`flex-1 ${
                            !event.unlocked ? "opacity-50" : ""
                          }`}
                        >
                          <Card
                            className={`transition-all duration-300 ${
                              event.unlocked
                                ? "hover:shadow-md cursor-pointer"
                                : ""
                            }`}
                            onClick={() => handleEventClick(event)}
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
                                  <Badge
                                    variant={
                                      event.completed ? "default" : "secondary"
                                    }
                                  >
                                    {event.completed
                                      ? "已完成"
                                      : event.unlocked
                                      ? "可挑戰"
                                      : "未解鎖"}
                                  </Badge>
                                  <Badge variant="outline">
                                    {event.difficulty === "beginner"
                                      ? "初級"
                                      : event.difficulty === "intermediate"
                                      ? "中級"
                                      : event.difficulty === "advanced"
                                      ? "高級"
                                      : "專家"}
                                  </Badge>
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
                                  <Trophy className="h-4 w-4 text-accent" />
                                  <span>{event.reward} XP</span>
                                </div>
                                {event.unlocked && !event.completed && (
                                  <Button size="sm" className="font-medium">
                                    <Play className="h-4 w-4 mr-1" />
                                    開始任務
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
                                    未解鎖
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {selectedEvent?.year} - {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedEvent?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="font-medium">獎勵經驗</p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedEvent?.reward} XP
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="font-medium">難度等級</p>
                    <p className="text-lg font-semibold">
                      {selectedEvent?.difficulty === "beginner"
                        ? "初級"
                        : selectedEvent?.difficulty === "intermediate"
                        ? "中級"
                        : selectedEvent?.difficulty === "advanced"
                        ? "高級"
                        : "專家"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-serif font-semibold mb-2">
                你的 AI 教練：{selectedCoach.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedCoach.description}
              </p>
              <p className="text-sm">
                <span className="font-medium">建議策略：</span>
                {selectedCoach.id === "steady-sam" &&
                  "在危機中保持冷靜，選擇防禦性資產如債券和黃金。"}
                {selectedCoach.id === "growth-guru" &&
                  "平衡風險與機會，分散投資於不同資產類別。"}
                {selectedCoach.id === "adventure-alex" &&
                  "危機就是轉機！尋找被低估的高成長潛力標的。"}
                {selectedCoach.id === "yield-yoda" &&
                  "專注於能產生穩定現金流的投資，讓複利為你工作。"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={startMission} className="flex-1 font-medium">
                <Play className="h-4 w-4 mr-2" />
                開始時空任務
              </Button>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                稍後挑戰
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={gameStarted}
        onOpenChange={() => {
          setGameStarted(false);
          setSelectedEvent(null);
          setMissionStep("intro");
          setSelectedInvestment(null);
          setMissionResult(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {currentMission && (
            <>
              {/* Mission Introduction */}
              {missionStep === "intro" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      時空穿越：{selectedEvent?.year}年
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedEvent?.title}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          歷史背景
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentMission.context}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          投資情境
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentMission.situation}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-accent/10">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <span className="text-2xl">
                            {selectedCoach.avatar}
                          </span>
                          {selectedCoach.name} 的建議
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {
                            currentMission.coachAdvice[
                              selectedCoach.id as keyof typeof currentMission.coachAdvice
                            ]
                          }
                        </p>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setMissionStep("decision")}
                        className="flex-1 font-medium"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        開始投資決策
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGameStarted(false);
                          setSelectedEvent(null);
                          setMissionStep("intro");
                          setSelectedInvestment(null);
                          setMissionResult(null);
                        }}
                      >
                        離開任務
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Investment Decision */}
              {missionStep === "decision" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      投資決策時刻
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      選擇你的投資策略，每個選擇都會影響最終結果
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentMission.options.map((option) => (
                        <Card
                          key={option.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedInvestment === option.id
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => setSelectedInvestment(option.id)}
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{option.name}</h4>
                                <Badge
                                  variant={
                                    option.risk === "極高"
                                      ? "destructive"
                                      : option.risk === "高"
                                      ? "secondary"
                                      : option.risk === "中"
                                      ? "outline"
                                      : "default"
                                  }
                                >
                                  {option.risk}風險
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                <span>預期報酬：{option.expectedReturn}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() =>
                          selectedInvestment &&
                          makeInvestment(selectedInvestment)
                        }
                        disabled={!selectedInvestment}
                        className="flex-1 font-medium"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        確認投資
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setMissionStep("intro")}
                      >
                        重新考慮
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Mission Result */}
              {missionStep === "result" && missionResult && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                      {missionResult.performance === "profit" ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      )}
                      任務結果
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      讓我們看看你的投資決策結果如何
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <Card
                      className={`${
                        missionResult.performance === "profit"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              你選擇了
                            </p>
                            <p className="text-xl font-bold">
                              {missionResult.option.name}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                初始投資
                              </p>
                              <p className="text-lg font-semibold">$100,000</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                實際報酬率
                              </p>
                              <p
                                className={`text-lg font-semibold ${
                                  missionResult.performance === "profit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {missionResult.actualReturn > 0 ? "+" : ""}
                                {missionResult.actualReturn}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                最終金額
                              </p>
                              <p
                                className={`text-lg font-semibold ${
                                  missionResult.performance === "profit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                ${missionResult.finalAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3">
                          歷史真相
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentMission.outcome}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-accent/10">
                      <CardContent className="pt-6">
                        <h4 className="font-serif font-semibold mb-3 flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-accent" />
                          獲得獎勵
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">
                              基礎經驗值：{selectedEvent?.reward} XP
                            </p>
                            {missionResult.performance === "profit" && (
                              <p className="text-sm text-green-600">
                                表現獎勵：+50 XP
                              </p>
                            )}
                          </div>
                          <p className="text-xl font-bold text-primary">
                            總計：
                            {(selectedEvent?.reward || 0) +
                              (missionResult.performance === "profit"
                                ? 50
                                : 0)}{" "}
                            XP
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={completeMission}
                      className="w-full font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      完成任務
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-center flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              恭喜！學習任務完成
              <Trophy className="h-8 w-8 text-yellow-500" />
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              你已經成功穿越了金融歷史的重要時刻，是時候回顧你的學習成果了！
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Achievement Banner */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎓</div>
                  <h3 className="font-serif text-2xl font-bold">
                    時空投資大師
                  </h3>
                  <p className="text-muted-foreground">
                    你已經掌握了從1990年到2025年的重要金融事件，成為真正的投資時間旅行者！
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Learning Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {calculateLearningStats().completedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">完成任務</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">{playerXP}</p>
                  <p className="text-sm text-muted-foreground">總經驗值</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {calculateLearningStats().averageScore}
                  </p>
                  <p className="text-sm text-muted-foreground">平均得分</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">
                    {calculateLearningStats().completionRate}%
                  </p>
                  <p className="text-sm text-muted-foreground">完成率</p>
                </CardContent>
              </Card>
            </div>

            {/* Learning Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  你的學習成就
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
                  你的時空旅程回顧
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialEvents.map((event) => (
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
                          獲得 {event.reward} XP
                        </p>
                      </div>
                      <Badge variant="default">已完成</Badge>
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
                  關鍵學習要點
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">💰 投資原則</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 分散投資降低風險</li>
                      <li>• 長期投資勝過短期投機</li>
                      <li>• 危機中保持冷靜理性</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📈 市場洞察</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 泡沫總會破滅</li>
                      <li>• 危機創造投資機會</li>
                      <li>• 歷史會重演但不會完全相同</li>
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
                  下一步學習建議
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    🎯 <strong>實踐應用：</strong>
                    開始小額投資，將學到的知識應用到現實中
                  </p>
                  <p className="text-sm">
                    📚 <strong>深度學習：</strong>閱讀更多金融書籍，了解投資理論
                  </p>
                  <p className="text-sm">
                    🌐 <strong>持續關注：</strong>
                    關注當前市場動態，培養投資敏感度
                  </p>
                  <p className="text-sm">
                    👥 <strong>分享交流：</strong>與朋友家人分享你學到的金融知識
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowSummary(false)}
                className="flex-1 font-medium"
              >
                <Trophy className="h-4 w-4 mr-2" />
                保存學習成果
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                重新開始遊戲
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
