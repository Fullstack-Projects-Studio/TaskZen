"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FocusSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getSettings() {
  try {
    const raw = localStorage.getItem("taskzen-focus-settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { work: 25, break: 5 };
}

export function FocusSettingsDialog({ open, onOpenChange }: FocusSettingsDialogProps) {
  const [work, setWork] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  useEffect(() => {
    if (open) {
      const s = getSettings();
      setWork(s.work);
      setBreakTime(s.break);
    }
  }, [open]);

  function handleSave() {
    localStorage.setItem(
      "taskzen-focus-settings",
      JSON.stringify({ work, break: breakTime })
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Focus Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Work Duration (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={120}
              value={work}
              onChange={(e) => setWork(parseInt(e.target.value) || 25)}
            />
          </div>
          <div className="space-y-2">
            <Label>Break Duration (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={breakTime}
              onChange={(e) => setBreakTime(parseInt(e.target.value) || 5)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
