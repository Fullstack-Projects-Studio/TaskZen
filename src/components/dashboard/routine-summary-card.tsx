"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { calculateFreeTime } from "@/lib/routine";
import { useRoutine, useScheduleBlocks } from "@/hooks/use-routine";

export function RoutineSummaryCard() {
  const { data: routine } = useRoutine();
  const { data: blocks } = useScheduleBlocks();

  const today = new Date().getDay();

  const freeTime = useMemo(() => {
    if (!routine?.wakeUpTime) return null;
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

  if (!freeTime) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Set up your routine</p>
            <p className="text-xs text-muted-foreground">
              Track your free time and daily schedule
            </p>
          </div>
          <Link href="/routine" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Set Up
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-green-500/10">
          <Clock className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">
            You have {freeTime.freeHours} free hours today
          </p>
          <p className="text-xs text-muted-foreground">
            {freeTime.awakeHours}h awake, {freeTime.busyHours}h busy
          </p>
        </div>
        <Link href="/routine" className={buttonVariants({ variant: "outline", size: "sm" })}>
          View
        </Link>
      </CardContent>
    </Card>
  );
}
