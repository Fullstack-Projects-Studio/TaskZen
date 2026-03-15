"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  function goBack() {
    if (month === 0) {
      onChange(11, year - 1);
    } else {
      onChange(month - 1, year);
    }
  }

  function goForward() {
    if (isCurrentMonth) return;
    if (month === 11) {
      onChange(0, year + 1);
    } else {
      onChange(month + 1, year);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={goBack}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold min-w-[160px] text-center">
        {format(new Date(year, month), "MMMM yyyy")}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={goForward}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
