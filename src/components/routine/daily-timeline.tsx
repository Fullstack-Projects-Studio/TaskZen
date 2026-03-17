"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateFreeTime } from "@/lib/routine";
import { useRoutine, useScheduleBlocks } from "@/hooks/use-routine";

const slotColors: Record<string, string> = {
  sleep: "bg-gray-300 dark:bg-gray-700",
  busy: "bg-red-400",
  free: "bg-green-400",
};

export function DailyTimeline() {
  const { data: routine } = useRoutine();
  const { data: blocks } = useScheduleBlocks();

  const today = new Date().getDay();

  const freeTime = useMemo(() => {
    if (!routine) return null;
    return calculateFreeTime(
      routine.wakeUpTime,
      routine.sleepTime,
      (blocks || []).map((b) => ({
        label: b.label,
        startTime: b.startTime,
        endTime: b.endTime,
        days: b.days as number[],
        type: b.type,
      })),
      today
    );
  }, [routine, blocks, today]);

  if (!freeTime) return null;

  const totalMinutes = 24 * 60;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {freeTime.slots.map((slot, i) => {
            const widthPercent = (slot.duration / totalMinutes) * 100;
            if (widthPercent < 0.5) return null;

            return (
              <Tooltip key={i}>
                <TooltipTrigger
                  render={
                    <div
                      className={`${slotColors[slot.type]} transition-all cursor-pointer hover:opacity-80`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  }
                />
                <TooltipContent>
                  <p className="text-xs font-medium">{slot.label || slot.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {slot.start} - {slot.end} ({Math.round(slot.duration / 60 * 10) / 10}h)
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>

        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-700" />
            Sleep
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400" />
            Busy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-400" />
            Free
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
