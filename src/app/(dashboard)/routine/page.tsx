"use client";

import { WakeSleepForm } from "@/components/routine/wake-sleep-form";
import { ScheduleBlockForm } from "@/components/routine/schedule-block-form";
import { ScheduleList } from "@/components/routine/schedule-list";
import { FreeTimeCard } from "@/components/routine/free-time-card";
import { DailyTimeline } from "@/components/routine/daily-timeline";

export default function RoutinePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily Routine</h1>
        <p className="text-muted-foreground text-sm">
          Set up your schedule and find pockets of free time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WakeSleepForm />
        <FreeTimeCard />
      </div>

      <DailyTimeline />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScheduleBlockForm />
        <ScheduleList />
      </div>
    </div>
  );
}
