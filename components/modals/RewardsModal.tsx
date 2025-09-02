"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Check, Lock, CheckCircle, QrCode } from "lucide-react";
import { Reward, rewardsStore } from "@/components/data/rewards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerXP: number;
  redeemedRewards: string[];
  onRedeemReward: (reward: Reward) => void;
}

export function RewardsModal({
  open,
  onOpenChange,
  playerXP,
  redeemedRewards,
  onRedeemReward,
}: RewardsModalProps) {
  const canAfford = (cost: number) => playerXP >= cost;
  const isRedeemed = (rewardId: string) => redeemedRewards.includes(rewardId);
  const [redeemMode, setRedeemMode] = useState<"list" | "redeem" | "success">(
    "list"
  );
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [email, setEmail] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setRedeemMode("redeem");
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !email) return;

    setIsRedeeming(true);

    try {
      // Call the backend API to redeem reward
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/rewards/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: email,
            reward_name: selectedReward.name,
            partner: selectedReward.partner,
            reward_description: selectedReward.description,
            player_xp: playerXP,
            reward_cost: selectedReward.cost,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Call the parent function to update XP and redeemed rewards
        onRedeemReward(selectedReward);

        // Set the coupon code from the API response
        setCouponCode(result.coupon_code);

        // Show success message
        setRedeemMode("success");

        console.log(
          `✅ Reward redeemed successfully! Email ${
            result.simulated ? "simulated" : "sent"
          } to ${email}`
        );
      } else {
        // Handle error
        alert(`Failed to redeem reward: ${result.message}`);
        setRedeemMode("redeem"); // Stay in redeem mode
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Failed to connect to server. Please try again.");
      setRedeemMode("redeem"); // Stay in redeem mode
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleBackToList = () => {
    setRedeemMode("list");
    setSelectedReward(null);
    setEmail("");
    setIsRedeeming(false);
    setCouponCode("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setRedeemMode("list");
    setSelectedReward(null);
    setEmail("");
    setIsRedeeming(false);
    setCouponCode("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {redeemMode === "list" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Gift className="h-6 w-6 text-yellow-600" />
                Rewards Store
              </DialogTitle>
              <DialogDescription>
                Exchange your XP for amazing rewards from our partner brands!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current XP Display */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Your Available XP
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {playerXP} XP
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Rewards Redeemed
                    </p>
                    <p className="text-lg font-semibold text-secondary">
                      {redeemedRewards.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rewards List */}
              <div className="space-y-4">
                {rewardsStore.map((reward) => (
                  <Card
                    key={reward.id}
                    className={`relative ${
                      isRedeemed(reward.id) ? "opacity-60" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="text-4xl flex-shrink-0">
                          {reward.image}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {reward.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Partner: {reward.partner}
                              </p>
                            </div>
                            <Badge
                              variant={
                                canAfford(reward.cost) ? "default" : "secondary"
                              }
                              className="ml-2"
                            >
                              {reward.cost} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {reward.description}
                          </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => handleRedeemClick(reward)}
                            disabled={
                              !canAfford(reward.cost) || isRedeemed(reward.id)
                            }
                            variant={
                              isRedeemed(reward.id) ? "outline" : "default"
                            }
                            size="sm"
                          >
                            {isRedeemed(reward.id) ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Redeemed
                              </>
                            ) : canAfford(reward.cost) ? (
                              <>
                                <Gift className="h-4 w-4 mr-2" />
                                Redeem
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Need {reward.cost - playerXP} more
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    {isRedeemed(reward.id) && (
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          ✓ Claimed
                        </Badge>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* How it works section */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">
                    How Rewards Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-2">
                  <p>• Complete missions to earn XP</p>
                  <p>• Exchange XP for real rewards from partner brands</p>
                  <p>
                    • Voucher codes will be sent to your email after redemption
                  </p>
                  <p>• Each reward can only be claimed once per account</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {redeemMode === "redeem" && selectedReward && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-600" />
                Redeem Reward
              </DialogTitle>
              <DialogDescription>
                Enter your email to receive your {selectedReward.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedReward.image}</div>
                    <div>
                      <h3 className="font-semibold">{selectedReward.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedReward.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Partner: {selectedReward.partner}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="shadow-sm border-gray-300"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send your voucher code to this email address
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Cost:</strong> {selectedReward.cost} XP (You have:{" "}
                  {playerXP} XP)
                </p>
                {playerXP < selectedReward.cost && (
                  <p className="text-xs text-red-600 mt-1">
                    You need {selectedReward.cost - playerXP} more XP to redeem
                    this reward
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmRedeem}
                  disabled={
                    !email || playerXP < selectedReward.cost || isRedeeming
                  }
                  className="flex-1"
                >
                  {isRedeeming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Now
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleBackToList}>
                  Back to Rewards
                </Button>
              </div>
            </div>
          </>
        )}

        {redeemMode === "success" && selectedReward && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Reward Redeemed!
              </DialogTitle>
              <DialogDescription>
                Your voucher has been sent to your email
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">🎉</div>
                    <h3 className="font-semibold text-green-800">
                      {selectedReward.name} Redeemed!
                    </h3>
                    <p className="text-sm text-green-700">
                      Check your email for the voucher code
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Your Voucher Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-3 rounded border-2 border-dashed border-gray-300 text-center">
                    <p className="font-mono text-lg font-bold tracking-wider">
                      {couponCode}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show this code at {selectedReward.partner} to redeem
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  How to Use:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Check your email for the complete voucher details</li>
                  <li>
                    • Present this code at any {selectedReward.partner} location
                  </li>
                  <li>
                    • The staff will scan or enter the code for your discount
                  </li>
                  <li>• Valid for 30 days from today</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBackToList} className="flex-1">
                  Back to Rewards
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
