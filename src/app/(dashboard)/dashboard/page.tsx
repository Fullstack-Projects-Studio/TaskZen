"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { useStats } from "@/hooks/use-stats";
import { usePhotoStats } from "@/hooks/use-photo-stats";

const CompletionPieChart = dynamic(
  () => import("@/components/dashboard/completion-pie-chart").then((m) => m.CompletionPieChart),
  { ssr: false }
);
const CategoryChart = dynamic(
  () => import("@/components/dashboard/category-chart").then((m) => m.CategoryChart),
  { ssr: false }
);
const StreakCounter = dynamic(
  () => import("@/components/dashboard/streak-counter").then((m) => m.StreakCounter),
  { ssr: false }
);
const RecentActivity = dynamic(
  () => import("@/components/dashboard/recent-activity").then((m) => m.RecentActivity),
  { ssr: false }
);
const MotivationCard = dynamic(
  () => import("@/components/dashboard/motivation-card").then((m) => m.MotivationCard),
  { ssr: false }
);
const XpLevelCard = dynamic(
  () => import("@/components/dashboard/xp-level-card").then((m) => m.XpLevelCard),
  { ssr: false }
);
const BadgesCard = dynamic(
  () => import("@/components/dashboard/badges-card").then((m) => m.BadgesCard),
  { ssr: false }
);
const ReflectionPrompt = dynamic(
  () => import("@/components/dashboard/reflection-prompt").then((m) => m.ReflectionPrompt),
  { ssr: false }
);
const RoutineSummaryCard = dynamic(
  () => import("@/components/dashboard/routine-summary-card").then((m) => m.RoutineSummaryCard),
  { ssr: false }
);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XpLevelCard stats={stats} isLoading={isLoading} />
        <BadgesCard stats={stats} totalCompletions={stats?.totalCompletions ?? 0} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReflectionPrompt />
        <RoutineSummaryCard />
      </div>

      <MotivationCard photoStats={photoStats} isLoading={photoStatsLoading} />

      <RecentActivity stats={stats} isLoading={isLoading} />
    </div>
  );
}
