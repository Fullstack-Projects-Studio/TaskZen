"use client";

import { Trash2, Briefcase, GraduationCap, Building2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { useScheduleBlocks, useDeleteScheduleBlock } from "@/hooks/use-routine";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  WORK: Briefcase,
  SCHOOL: GraduationCap,
  COLLEGE: Building2,
  CUSTOM: Tag,
};

const typeColors: Record<string, string> = {
  WORK: "text-blue-500",
  SCHOOL: "text-green-500",
  COLLEGE: "text-purple-500",
  CUSTOM: "text-gray-500",
};

export function ScheduleList() {
  const { data: blocks, isLoading } = useScheduleBlocks();
  const deleteBlock = useDeleteScheduleBlock();

  if (isLoading) return null;

  if (!blocks || blocks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p className="text-sm">No schedule blocks yet. Add one above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {blocks.map((block) => {
          const Icon = typeIcons[block.type] || Tag;
          const color = typeColors[block.type] || "text-gray-500";
          const dayLabels = (block.days as number[])
            .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label)
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={block.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${color}`} />
                <div>
                  <p className="font-medium text-sm">{block.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {block.startTime} - {block.endTime} | {dayLabels}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => deleteBlock.mutate(block.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
