"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Camera, Trophy, TrendingUp, Heart, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMotivationTier,
  getDailyQuote,
  MOTIVATIONAL_VIDEOS,
} from "@/lib/constants";
import type { PhotoStats } from "@/hooks/use-photo-stats";

interface MotivationCardProps {
  photoStats: PhotoStats | undefined;
  isLoading: boolean;
}

const tierIcons = {
  champion: Trophy,
  rising: TrendingUp,
  building: Heart,
  starting: Flame,
} as const;

export function MotivationCard({ photoStats, isLoading }: MotivationCardProps) {
  const tier = photoStats
    ? getMotivationTier(photoStats.overallConsistency)
    : null;

  const dailyQuote = useMemo(() => {
    if (!tier) return "";
    return getDailyQuote(tier.id);
  }, [tier]);

  const videoId = useMemo(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_VIDEOS.length);
    return MOTIVATIONAL_VIDEOS[idx].id;
  }, []);

  if (isLoading) {
    return <Skeleton className="h-52 w-full rounded-lg" />;
  }

  if (!photoStats || !tier) return null;

  const TierIcon = tierIcons[tier.id as keyof typeof tierIcons] ?? Camera;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className={`border ${tier.borderColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`p-2 rounded-lg ${tier.bgColor}`}>
                <TierIcon className={`h-5 w-5 ${tier.color}`} />
              </div>
              Photo Consistency
            </CardTitle>
            <Badge
              variant="outline"
              className={`${tier.color} ${tier.borderColor}`}
            >
              {tier.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {photoStats.totalPhotoDays} of {photoStats.totalApplicableDays} days captured
              </span>
              <span className={`text-lg font-bold ${tier.color}`}>
                {photoStats.overallConsistency}%
              </span>
            </div>
            <Progress
              value={photoStats.overallConsistency}
              className="h-2.5"
            />
          </div>

          <div className={`rounded-xl p-5 ${tier.bgColor} my-2`}>
            <p
              className={`text-xl md:text-2xl font-bold leading-relaxed tracking-wide ${tier.color}`}
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              &ldquo;{dailyQuote}&rdquo;
            </p>
          </div>

          {tier.showVideo && (
            <div className="aspect-video rounded-lg overflow-hidden border">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Motivational Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {photoStats.perTask.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Per Task Breakdown
              </p>
              {photoStats.perTask.map((task) => (
                <div key={task.taskId} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="text-xs truncate flex-1">{task.taskTitle}</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${task.consistency}%`,
                        backgroundColor: task.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {task.consistency}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
