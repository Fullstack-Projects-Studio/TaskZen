"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Archive, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useArchives, useArchiveMonth } from "@/hooks/use-archives";
import { getCategoryLabel, getCategoryColor } from "@/lib/constants";

interface ArchiveCardProps {
  month: number;
  year: number;
  isCurrentMonth: boolean;
}

export function ArchiveCard({ month, year, isCurrentMonth }: ArchiveCardProps) {
  const { data: archives } = useArchives(year);
  const archiveMonth = useArchiveMonth();

  const archive = archives?.find((a) => a.month === month && a.year === year);

  // Auto-archive past months that haven't been archived yet
  useEffect(() => {
    if (!isCurrentMonth && !archive && archives !== undefined && !archiveMonth.isPending) {
      archiveMonth.mutate({ month, year });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentMonth, archive, archives, month, year]);

  if (isCurrentMonth || !archive) return null;

  const monthName = format(new Date(year, month), "MMMM yyyy");
  const categoryEntries = Object.entries(archive.categoryBreakdown);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {monthName} Summary
            </CardTitle>
            <Badge variant="secondary">Archived</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{archive.completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{archive.totalTasks}</p>
              <p className="text-xs text-muted-foreground">Total Expected</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(archive.completionRate)}%</p>
              <p className="text-xs text-muted-foreground">Rate</p>
            </div>
          </div>

          <Progress value={archive.completionRate} className="h-2" />

          {categoryEntries.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                By Category
              </p>
              {categoryEntries.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span>{getCategoryLabel(category)}</span>
                  </div>
                  <span className="text-muted-foreground">{count as number} completions</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
