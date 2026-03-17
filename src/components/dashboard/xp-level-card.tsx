"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getXPProgress } from "@/lib/gamification";
import type { Stats } from "@/hooks/use-stats";

interface XpLevelCardProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function XpLevelCard({ stats, isLoading }: XpLevelCardProps) {
  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const progress = getXPProgress(xp, level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-yellow-500" />
            Level {isLoading ? "--" : level}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{isLoading ? "--" : xp} XP total</span>
            <span className="text-muted-foreground">
              {isLoading ? "--" : progress.current} / {isLoading ? "--" : progress.needed} XP
            </span>
          </div>
          <Progress value={isLoading ? 0 : progress.percent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {isLoading ? "..." : `${progress.needed - progress.current} XP to next level`}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
