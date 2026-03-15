"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/hooks/use-stats";

interface RecentActivityProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function RecentActivity({ stats, isLoading }: RecentActivityProps) {
  const activities = stats?.recentActivity || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground animate-pulse">Loading...</p>
          ) : activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: activity.task.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed for {format(new Date(activity.date), "MMM d")} &middot; {format(new Date(activity.completedAt), "h:mm a")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
