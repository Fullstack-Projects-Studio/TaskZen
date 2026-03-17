"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSaveReflection } from "@/hooks/use-reflections";

const MOODS = [
  { value: 1, emoji: "😞", label: "Terrible" },
  { value: 2, emoji: "😔", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

interface ReflectionFormProps {
  date: string; // yyyy-MM-dd
  initialContent?: string;
  initialMood?: number;
}

export function ReflectionForm({ date, initialContent = "", initialMood = 3 }: ReflectionFormProps) {
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState(initialMood);
  const saveReflection = useSaveReflection();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await saveReflection.mutateAsync({ date, content, mood });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">How was your day?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    mood === m.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reflection</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What went well today? What could be better?"
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/2000
            </p>
          </div>

          <Button
            type="submit"
            disabled={saveReflection.isPending || !content.trim()}
            className="w-full"
          >
            {saveReflection.isPending ? "Saving..." : "Save Reflection"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
