"use client";

import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationContext } from "@/components/providers/notification-provider";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <p className="text-xs text-muted-foreground">
            Notifications will fire when the app tab is open and a task&apos;s
            scheduled time matches the current time.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
