"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryLabel, getCategoryColor } from "@/lib/constants";
import type { Stats } from "@/hooks/use-stats";

interface CategoryChartProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function CategoryChart({ stats, isLoading }: CategoryChartProps) {
  const data = Object.entries(stats?.categoryBreakdown || {}).map(
    ([category, values]) => ({
      name: getCategoryLabel(category),
      completed: values.completed,
      color: getCategoryColor(category),
    })
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">By Category</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <span className="text-muted-foreground animate-pulse">Loading...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
