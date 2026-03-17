"use client";

import { motion } from "framer-motion";
import { Award, Footprints, Sword, Target, Crown, Shield, Star, Medal, Gem } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BADGES } from "@/lib/gamification";
import type { Stats } from "@/hooks/use-stats";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  sword: Sword,
  target: Target,
  crown: Crown,
  shield: Shield,
  star: Star,
  medal: Medal,
  gem: Gem,
};

interface BadgesCardProps {
  stats: Stats | undefined;
  totalCompletions: number;
  isLoading: boolean;
}

export function BadgesCard({ stats, totalCompletions, isLoading }: BadgesCardProps) {
  const userStats = {
    totalCompletions,
    bestStreak: stats?.bestStreak ?? 0,
    level: stats?.level ?? 1,
    xp: stats?.xp ?? 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-purple-500" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const earned = !isLoading && badge.condition(userStats);
              const Icon = iconMap[badge.icon] || Award;

              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger
                    render={
                      <div
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer ${
                          earned
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/50 text-muted-foreground/40"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-[10px] font-medium text-center leading-tight">
                          {badge.name}
                        </span>
                      </div>
                    }
                  />
                  <TooltipContent>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {earned && <p className="text-xs text-green-500 mt-1">Earned!</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
