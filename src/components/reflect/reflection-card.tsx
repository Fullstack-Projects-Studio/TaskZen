"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Reflection } from "@/hooks/use-reflections";

const MOOD_EMOJI: Record<number, string> = {
  1: "😞",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "🤩",
};

interface ReflectionCardProps {
  reflection: Reflection;
  onDelete?: (id: string) => void;
}

export function ReflectionCard({ reflection, onDelete }: ReflectionCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{MOOD_EMOJI[reflection.mood] || "😐"}</span>
              <span className="text-sm font-medium">
                {format(new Date(reflection.date), "EEEE, MMMM d")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {reflection.content}
            </p>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(reflection.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
