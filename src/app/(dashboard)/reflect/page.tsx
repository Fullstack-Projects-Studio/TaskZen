"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReflectionForm } from "@/components/reflect/reflection-form";
import { ReflectionCalendar } from "@/components/reflect/reflection-calendar";
import { ReflectionCard } from "@/components/reflect/reflection-card";
import { useReflections, useDeleteReflection } from "@/hooks/use-reflections";

export default function ReflectPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(format(now, "yyyy-MM-dd"));

  const { data: reflections, isLoading } = useReflections(month, year);
  const deleteReflection = useDeleteReflection();

  const todayStr = format(now, "yyyy-MM-dd");
  const isToday = selectedDate === todayStr;

  const existingReflection = reflections?.find((r) => {
    const rDate = new Date(r.date).toISOString().split("T")[0];
    return rDate === selectedDate;
  });

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reflect</h1>
        <p className="text-muted-foreground text-sm">
          Daily journaling to track your mindset and growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{format(new Date(year, month), "MMMM yyyy")}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <ReflectionCalendar
            reflections={reflections || []}
            month={month}
            year={year}
            onDateSelect={setSelectedDate}
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">
            {isToday ? "Today" : format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
          </p>

          {existingReflection ? (
            <div className="space-y-3">
              <ReflectionCard
                reflection={existingReflection}
                onDelete={(id) => deleteReflection.mutate(id)}
              />
              {isToday && (
                <ReflectionForm
                  date={selectedDate}
                  initialContent={existingReflection.content}
                  initialMood={existingReflection.mood}
                />
              )}
            </div>
          ) : isToday || new Date(selectedDate) <= now ? (
            <ReflectionForm date={selectedDate} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Future date - come back later to reflect.
            </p>
          )}
        </div>
      </div>

      {!isLoading && reflections && reflections.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Reflections</h2>
          <div className="space-y-3">
            {reflections.slice(0, 5).map((r) => (
              <ReflectionCard
                key={r.id}
                reflection={r}
                onDelete={(id) => deleteReflection.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
