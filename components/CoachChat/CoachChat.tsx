"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  message: string;
  timestamp: Date;
}

interface AICoach {
  id: string;
  name: string;
  avatar: string;
  style: string;
  gif?: string;
}

interface CoachChatProps {
  selectedCoach: AICoach;
  chatMessages: ChatMessage[];
  newMessage: string;
  setNewMessage: (val: string) => void;
  sendMessage: () => void;
}

export default function CoachChat({
  selectedCoach,
  chatMessages,
  newMessage,
  setNewMessage,
  sendMessage,
}: CoachChatProps) {
  return (
    <Card className="bg-sidebar border-sidebar-border h-[800px] flex flex-col">
      <CardHeader className="bg-sidebar-primary text-sidebar-primary-foreground flex flex-col items-center">
        <div className="mb-2">
          <div className="h-40 w-40 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              src={selectedCoach.gif}
              alt={`${selectedCoach.name} gif`}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
        <CardTitle className="flex items-center gap-2 justify-center">
          <MessageCircle className="h-5 w-5" />
          {selectedCoach.name}
        </CardTitle>
        <p className="text-sm opacity-90">
          {selectedCoach.style} Investment Coach
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask your AI coach..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="bg-input border-border"
            />
            <Button
              onClick={sendMessage}
              size="sm"
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
