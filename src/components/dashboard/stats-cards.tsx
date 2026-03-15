"use client";

import { motion } from "framer-motion";
import { ListTodo, CheckCircle2, TrendingUp, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Stats } from "@/hooks/use-stats";

interface StatsCardsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

const cardData = [
  {
    key: "totalTasks",
    label: "Total Tasks",
    icon: ListTodo,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "completedToday",
    label: "Completed Today",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    key: "completionRate",
    label: "Monthly Rate",
    icon: TrendingUp,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    suffix: "%",
  },
  {
    key: "streak",
    label: "Current Streak",
    icon: Flame,
    color: "text-red-500",
    bg: "bg-red-500/10",
    suffix: " days",
  },
] as const;

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardData.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? (
                      <span className="animate-pulse">--</span>
                    ) : (
                      <>
                        {stats?.[item.key] ?? 0}
                        {"suffix" in item ? item.suffix : ""}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
