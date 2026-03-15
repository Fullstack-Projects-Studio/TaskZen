"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreakCounterProps {
  streak: number;
  isLoading: boolean;
}

export function StreakCounter({ streak, isLoading }: StreakCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(streak / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= streak) {
        setDisplayCount(streak);
        clearInterval(interval);
      } else {
        setDisplayCount(current);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [streak, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Streak</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Flame className="h-12 w-12 text-orange-500" />
          </motion.div>
          <p className="text-4xl font-bold mt-2">
            {isLoading ? "--" : displayCount}
          </p>
          <p className="text-sm text-muted-foreground">
            {displayCount === 1 ? "day" : "days"} in a row
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
