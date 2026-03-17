"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useReflections } from "@/hooks/use-reflections";
import { format } from "date-fns";

export function ReflectionPrompt() {
  const { data: reflections } = useReflections();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const hasToday = reflections?.some((r) => {
    const rDate = new Date(r.date).toISOString().split("T")[0];
    return rDate === todayStr;
  });

  if (hasToday) return null;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <BookOpen className="h-5 w-5 text-purple-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">How was your day?</p>
          <p className="text-xs text-muted-foreground">
            Take a moment to reflect on today
          </p>
        </div>
        <Link href="/reflect" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Reflect
        </Link>
      </CardContent>
    </Card>
  );
}
