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
import { Gift, Check, Lock } from "lucide-react";
import { Reward, rewardsStore } from "@/components/data/rewards";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                <p className="text-2xl font-bold text-primary">{playerXP} XP</p>
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
                    <div className="text-4xl flex-shrink-0">{reward.image}</div>

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
                        onClick={() => onRedeemReward(reward)}
                        disabled={
                          !canAfford(reward.cost) || isRedeemed(reward.id)
                        }
                        variant={isRedeemed(reward.id) ? "outline" : "default"}
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
              <p>• Voucher codes will be sent to your email after redemption</p>
              <p>• Each reward can only be claimed once per account</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
