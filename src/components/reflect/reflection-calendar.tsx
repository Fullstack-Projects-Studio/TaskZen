"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Reflection } from "@/hooks/use-reflections";

const MOOD_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-400",
  5: "bg-green-600",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ReflectionCalendarProps {
  reflections: Reflection[];
  month: number;
  year: number;
  onDateSelect: (date: string) => void;
}

export function ReflectionCalendar({ reflections, month, year, onDateSelect }: ReflectionCalendarProps) {
  const reflectionMap = useMemo(() => {
    const map = new Map<string, Reflection>();
    reflections.forEach((r) => {
      const key = new Date(r.date).toISOString().split("T")[0];
      map.set(key, r);
    });
    return map;
  }, [reflections]);

  const days = useMemo(() => {
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(new Date(year, month));
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  const firstDayOffset = getDay(days[0]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {format(new Date(year, month), "MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const reflection = reflectionMap.get(dateStr);
            const today = isToday(day);

            const buttonEl = (
              <button
                onClick={() => onDateSelect(dateStr)}
                className={`w-full aspect-square rounded-md flex items-center justify-center text-xs relative transition-colors ${
                  today ? "ring-2 ring-primary" : ""
                } ${reflection ? "hover:opacity-80" : "hover:bg-accent"}`}
              >
                {day.getDate()}
                {reflection && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      MOOD_COLORS[reflection.mood] || "bg-yellow-500"
                    }`}
                  />
                )}
              </button>
            );

            if (reflection) {
              return (
                <Tooltip key={dateStr}>
                  <TooltipTrigger render={buttonEl} />
                  <TooltipContent>
                    <p className="text-xs">
                      Mood: {reflection.mood}/5 - {reflection.content.slice(0, 50)}
                      {reflection.content.length > 50 ? "..." : ""}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={dateStr}>{buttonEl}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
