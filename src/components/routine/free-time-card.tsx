"use client";

import { useMemo } from "react";
import { Clock, Sun, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateFreeTime } from "@/lib/routine";
import { useRoutine, useScheduleBlocks } from "@/hooks/use-routine";

export function FreeTimeCard() {
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

  const totalBar = freeTime.awakeHours;
  const busyPercent = totalBar > 0 ? (freeTime.busyHours / totalBar) * 100 : 0;
  const freePercent = totalBar > 0 ? (freeTime.freeHours / totalBar) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Today&apos;s Time Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Sun className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{freeTime.awakeHours}h</p>
            <p className="text-xs text-muted-foreground">Awake</p>
          </div>
          <div>
            <Activity className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{freeTime.busyHours}h</p>
            <p className="text-xs text-muted-foreground">Busy</p>
          </div>
          <div>
            <Clock className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{freeTime.freeHours}h</p>
            <p className="text-xs text-muted-foreground">Free</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${busyPercent}%` }}
            />
            <div
              className="bg-green-400 transition-all"
              style={{ width: `${freePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Busy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Free
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
