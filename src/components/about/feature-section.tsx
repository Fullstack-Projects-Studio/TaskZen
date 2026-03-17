"use client";

import type { LucideIcon } from "lucide-react";
import { ScrollFadeIn } from "@/components/animations";

interface FeatureSectionProps {
  title: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
  iconColor: string;
  reversed?: boolean;
  illustrationSlot: React.ReactNode;
}

export function FeatureSection({
  title,
  description,
  highlights,
  icon: Icon,
  iconColor,
  reversed = false,
  illustrationSlot,
}: FeatureSectionProps) {
  return (
    <ScrollFadeIn>
      <div
        className={`grid gap-8 md:gap-12 lg:grid-cols-2 items-center ${
          reversed ? "lg:direction-rtl" : ""
        }`}
        style={{ direction: reversed ? "rtl" : undefined }}
      >
        {/* Text side */}
        <div className="space-y-4" style={{ direction: "ltr" }}>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${iconColor}`}
          >
            <Icon className="h-4 w-4" />
            {title}
          </div>
          <p className="text-lg text-muted-foreground">{description}</p>
          <ul className="space-y-2">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Illustration side */}
        <div
          className="order-first lg:order-none"
          style={{ direction: "ltr" }}
        >
          {illustrationSlot}
        </div>
      </div>
    </ScrollFadeIn>
  );
}
