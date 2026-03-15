"use client";

import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/lib/constants";

export function CategoryBadge({ category, color }: { category: string; color: string }) {
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium"
      style={{ borderColor: color, color }}
    >
      {getCategoryLabel(category)}
    </Badge>
  );
}
