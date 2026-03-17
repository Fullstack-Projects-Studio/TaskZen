"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutine, useUpdateRoutine } from "@/hooks/use-routine";

export function WakeSleepForm() {
  const { data: routine } = useRoutine();
  const updateRoutine = useUpdateRoutine();
  const [wakeUpTime, setWakeUpTime] = useState("06:30");
  const [sleepTime, setSleepTime] = useState("22:30");

  useEffect(() => {
    if (routine) {
      setWakeUpTime(routine.wakeUpTime || "06:30");
      setSleepTime(routine.sleepTime || "22:30");
    }
  }, [routine]);

  function handleSave() {
    updateRoutine.mutate({ wakeUpTime, sleepTime });
    // Also save to localStorage for notification hook
    localStorage.setItem("taskzen-wakeup-time", wakeUpTime);
    localStorage.setItem("taskzen-sleep-time", sleepTime);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Wake & Sleep Times</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              Wake Up
            </Label>
            <Input
              type="time"
              value={wakeUpTime}
              onChange={(e) => setWakeUpTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-blue-500" />
              Sleep
            </Label>
            <Input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateRoutine.isPending}
          className="w-full"
        >
          {updateRoutine.isPending ? "Saving..." : "Save Times"}
        </Button>
      </CardContent>
    </Card>
  );
}
