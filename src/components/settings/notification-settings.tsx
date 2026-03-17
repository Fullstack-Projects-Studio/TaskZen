"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationContext } from "@/components/providers/notification-provider";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import Link from "next/link";

function permissionBadge(permission: string) {
  switch (permission) {
    case "granted":
      return <Badge variant="outline" className="border-green-500 text-green-500">Allowed</Badge>;
    case "denied":
      return <Badge variant="outline" className="border-red-500 text-red-500">Blocked</Badge>;
    case "unsupported":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Unsupported</Badge>;
    default:
      return <Badge variant="outline">Not requested</Badge>;
  }
}

export function NotificationSettings() {
  const { enabled, permission, toggleEnabled } = useNotificationContext();
  const { data: prefs } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  const [morningTime, setMorningTime] = useState("");
  const [eveningTime, setEveningTime] = useState("");
  const [morningEnabled, setMorningEnabled] = useState(false);
  const [eveningEnabled, setEveningEnabled] = useState(false);

  useEffect(() => {
    if (prefs) {
      setMorningTime(prefs.morningReminder || "09:00");
      setEveningTime(prefs.eveningReminder || "21:00");
      setMorningEnabled(!!prefs.morningReminder);
      setEveningEnabled(!!prefs.eveningReminder);
    }
  }, [prefs]);

  function saveMorningReminder() {
    const value = morningEnabled ? morningTime : null;
    updatePrefs.mutate({ morningReminder: value });
    if (value) {
      localStorage.setItem("taskzen-morning-reminder", value);
    } else {
      localStorage.removeItem("taskzen-morning-reminder");
    }
  }

  function saveEveningReminder() {
    const value = eveningEnabled ? eveningTime : null;
    updatePrefs.mutate({ eveningReminder: value });
    if (value) {
      localStorage.setItem("taskzen-evening-reminder", value);
    } else {
      localStorage.removeItem("taskzen-evening-reminder");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-sm">Browser notifications</p>
              <p className="text-xs text-muted-foreground">
                Get reminded when a task is due
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {permissionBadge(permission)}
            <Button
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={toggleEnabled}
              disabled={permission === "unsupported"}
            >
              {enabled ? "Enabled" : "Enable"}
            </Button>
          </div>
        </div>

        {permission === "denied" && (
          <p className="text-xs text-red-500">
            Notifications are blocked by your browser. Please allow notifications
            for this site in your browser settings.
          </p>
        )}

        {enabled && (
          <>
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">Morning Nudge</p>
                    <p className="text-xs text-muted-foreground">
                      Daily reminder of your tasks
                    </p>
                  </div>
                </div>
                <Button
                  variant={morningEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMorningEnabled(!morningEnabled);
                    setTimeout(saveMorningReminder, 0);
                  }}
                >
                  {morningEnabled ? "On" : "Off"}
                </Button>
              </div>
              {morningEnabled && (
                <div className="flex items-center gap-2 ml-7">
                  <Label className="text-xs">Time:</Label>
                  <Input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="w-32 h-8"
                  />
                  <Button size="sm" variant="outline" onClick={saveMorningReminder}>
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Evening Call</p>
                    <p className="text-xs text-muted-foreground">
                      Reminder for incomplete tasks
                    </p>
                  </div>
                </div>
                <Button
                  variant={eveningEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEveningEnabled(!eveningEnabled);
                    setTimeout(saveEveningReminder, 0);
                  }}
                >
                  {eveningEnabled ? "On" : "Off"}
                </Button>
              </div>
              {eveningEnabled && (
                <div className="flex items-center gap-2 ml-7">
                  <Label className="text-xs">Time:</Label>
                  <Input
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    className="w-32 h-8"
                  />
                  <Button size="sm" variant="outline" onClick={saveEveningReminder}>
                    Save
                  </Button>
                </div>
              )}
            </div>

            {prefs?.wakeUpTime && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Wake/sleep times are configured in{" "}
                  <Link href="/routine" className="text-primary underline">
                    Routine settings
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
