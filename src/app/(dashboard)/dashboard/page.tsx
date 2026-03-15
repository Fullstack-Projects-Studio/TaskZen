"use client";

import { useSession } from "next-auth/react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CompletionPieChart } from "@/components/dashboard/completion-pie-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MotivationCard } from "@/components/dashboard/motivation-card";
import { useStats } from "@/hooks/use-stats";
import { usePhotoStats } from "@/hooks/use-photo-stats";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats, isLoading } = useStats();
  const { data: photoStats, isLoading: photoStatsLoading } = usePhotoStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s your progress overview
        </p>
      </div>

      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CompletionPieChart stats={stats} isLoading={isLoading} />
        <CategoryChart stats={stats} isLoading={isLoading} />
        <StreakCounter streak={stats?.streak ?? 0} isLoading={isLoading} />
      </div>

      <MotivationCard photoStats={photoStats} isLoading={photoStatsLoading} />

      <RecentActivity stats={stats} isLoading={isLoading} />
    </div>
  );
}
