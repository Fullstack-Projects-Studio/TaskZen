"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/hooks/use-stats";

interface CompletionPieChartProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function CompletionPieChart({ stats, isLoading }: CompletionPieChartProps) {
  const completed = stats?.totalCompletions ?? 0;
  const rate = stats?.completionRate ?? 0;
  const missed = Math.max(0, 100 - rate);

  const data = [
    { name: "Completed", value: rate, color: "#10b981" },
    { name: "Missed", value: missed, color: "#ef4444" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <span className="text-muted-foreground animate-pulse">Loading...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          <p className="text-center text-sm text-muted-foreground mt-2">
            {completed} completions this month
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
