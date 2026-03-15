"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ChangePassword } from "@/components/settings/change-password";
import { DataExport } from "@/components/settings/data-export";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">Name</Label>
              <p className="font-medium">{session?.user?.name || "Not set"}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground text-sm">Email</Label>
              <p className="font-medium">{session?.user?.email}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {themes.map((t) => (
                <Button
                  key={t.value}
                  variant={mounted && theme === t.value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTheme(t.value)}
                >
                  <t.icon className="h-4 w-4 mr-2" />
                  {t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NotificationSettings />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ChangePassword />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <DataExport />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant="outline"
                  className="text-sm py-1 px-3"
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Categories are used to organize and color-code your tasks.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
