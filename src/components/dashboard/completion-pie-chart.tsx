"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/hooks/use-stats";
import { useEffect, useState } from "react";

interface CompletionPieChartProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function CompletionPieChart({ stats, isLoading }: CompletionPieChartProps) {
  const completed = stats?.totalCompletions ?? 0;
  const totalTasks = stats?.totalTasks ?? 0;
  const rate = stats?.completionRate ?? 0;
  const missed = Math.max(0, 100 - rate);

  const [animatedRate, setAnimatedRate] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    let start = 0;
    const end = rate;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedRate(end);
        clearInterval(timer);
      } else {
        setAnimatedRate(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [rate, isLoading]);

  const cx = 150;
  const cy = 150;
  const size = 300;

  // Ring parameters
  const outerR = 120;
  const outerWidth = 14;
  const innerR = 96;
  const innerWidth = 8;
  const glowR = 85;
  const glowWidth = 3;

  // Calculate arc for completion rate
  const completedAngle = (animatedRate / 100) * 360;
  const missedAngle = 360 - completedAngle;

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    if (endAngle - startAngle >= 360) {
      const mid = polarToCartesian(x, y, radius, startAngle + 180);
      const end = polarToCartesian(x, y, radius, startAngle + 359.99);
      const start = polarToCartesian(x, y, radius, startAngle);
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${mid.x} ${mid.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;
    }
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }

  // Tick marks for percentage labels
  const ticks = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * 360;
    const isMajor = i % 2 === 0;
    const tickOuterR = outerR + (isMajor ? 18 : 12);
    const tickInnerR = outerR + 4;
    const outerPos = polarToCartesian(cx, cy, tickOuterR, angle);
    const innerPos = polarToCartesian(cx, cy, tickInnerR, angle);
    const labelPos = polarToCartesian(cx, cy, outerR + 26, angle);
    return { angle, isMajor, outerPos, innerPos, labelPos, percent: i * 5 };
  });

  // Small decoration ticks
  const smallTicks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 360;
    const tickOuterR = outerR + 6;
    const tickInnerR = outerR + 2;
    const outerPos = polarToCartesian(cx, cy, tickOuterR, angle);
    const innerPos = polarToCartesian(cx, cy, tickInnerR, angle);
    return { outerPos, innerPos };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-[#0a0a0f] border-[#1a1a2e] overflow-hidden relative">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <CardHeader className="relative z-10 pb-0">
          <CardTitle className="text-lg text-gray-200 tracking-wide">
            Completion Rate
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 flex flex-col items-center pt-2">
          {isLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <span className="text-emerald-400/60 animate-pulse font-mono text-sm">
                Initializing...
              </span>
            </div>
          ) : (
            <>
              <div className="relative w-[300px] h-[300px]">
                <svg
                  width={size}
                  height={size}
                  viewBox={`0 0 ${size} ${size}`}
                  className="drop-shadow-lg"
                >
                  <defs>
                    {/* Glow filters */}
                    <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Gradient for completed arc */}
                    <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00ff88" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#00ff88" />
                    </linearGradient>

                    {/* Gradient for missed arc */}
                    <linearGradient id="missedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff4444" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#ff6b6b" />
                    </linearGradient>

                    {/* Inner glow gradient */}
                    <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00ff8820" />
                      <stop offset="70%" stopColor="#00ff8808" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Background glow circle */}
                  <circle cx={cx} cy={cy} r={outerR + 5} fill="url(#innerGlow)" />

                  {/* Small tick marks */}
                  {smallTicks.map((tick, i) => (
                    <line
                      key={`small-${i}`}
                      x1={tick.innerPos.x}
                      y1={tick.innerPos.y}
                      x2={tick.outerPos.x}
                      y2={tick.outerPos.y}
                      stroke="#1e3a2a"
                      strokeWidth={0.5}
                    />
                  ))}

                  {/* Major tick marks and labels */}
                  {ticks.map((tick, i) => (
                    <g key={`tick-${i}`}>
                      <line
                        x1={tick.innerPos.x}
                        y1={tick.innerPos.y}
                        x2={tick.outerPos.x}
                        y2={tick.outerPos.y}
                        stroke={tick.isMajor ? "#2dd4bf40" : "#1e3a2a"}
                        strokeWidth={tick.isMajor ? 1.5 : 0.8}
                      />
                      {tick.isMajor && (
                        <text
                          x={tick.labelPos.x}
                          y={tick.labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#2dd4bf60"
                          fontSize="7"
                          fontFamily="monospace"
                        >
                          {tick.percent}%
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Background ring (dark track) */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={outerR}
                    fill="none"
                    stroke="#1a1a2e"
                    strokeWidth={outerWidth}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={innerR}
                    fill="none"
                    stroke="#111122"
                    strokeWidth={innerWidth}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={glowR}
                    fill="none"
                    stroke="#0d0d1a"
                    strokeWidth={glowWidth}
                  />

                  {/* Completed arc - outer ring */}
                  {animatedRate > 0 && (
                    <path
                      d={describeArc(cx, cy, outerR, 0, completedAngle)}
                      fill="none"
                      stroke="url(#completedGrad)"
                      strokeWidth={outerWidth}
                      strokeLinecap="round"
                      filter="url(#glowGreen)"
                    />
                  )}

                  {/* Missed arc - outer ring */}
                  {missed > 0 && animatedRate < 100 && (
                    <path
                      d={describeArc(cx, cy, outerR, completedAngle, 360)}
                      fill="none"
                      stroke="url(#missedGrad)"
                      strokeWidth={outerWidth}
                      strokeLinecap="round"
                      filter="url(#glowRed)"
                    />
                  )}

                  {/* Completed arc - inner ring */}
                  {animatedRate > 0 && (
                    <path
                      d={describeArc(cx, cy, innerR, 0, completedAngle)}
                      fill="none"
                      stroke="#10b98180"
                      strokeWidth={innerWidth}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Missed arc - inner ring */}
                  {missed > 0 && animatedRate < 100 && (
                    <path
                      d={describeArc(cx, cy, innerR, completedAngle, 360)}
                      fill="none"
                      stroke="#ef444460"
                      strokeWidth={innerWidth}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Thin glow ring */}
                  {animatedRate > 0 && (
                    <path
                      d={describeArc(cx, cy, glowR, 0, completedAngle)}
                      fill="none"
                      stroke="#00ff8840"
                      strokeWidth={glowWidth}
                      filter="url(#glowCyan)"
                    />
                  )}

                  {/* Separator dots at junction points */}
                  {animatedRate > 0 && animatedRate < 100 && (
                    <>
                      <circle
                        cx={polarToCartesian(cx, cy, outerR, completedAngle).x}
                        cy={polarToCartesian(cx, cy, outerR, completedAngle).y}
                        r={3}
                        fill="#ffffff"
                        filter="url(#softGlow)"
                      />
                      <circle
                        cx={polarToCartesian(cx, cy, outerR, 0).x}
                        cy={polarToCartesian(cx, cy, outerR, 0).y}
                        r={2.5}
                        fill="#00ff88"
                        filter="url(#glowGreen)"
                      />
                    </>
                  )}

                  {/* Decorative corner brackets */}
                  <g stroke="#2dd4bf30" strokeWidth="1" fill="none">
                    <polyline points="20,30 20,20 30,20" />
                    <polyline points="270,20 280,20 280,30" />
                    <polyline points="280,270 280,280 270,280" />
                    <polyline points="30,280 20,280 20,270" />
                  </g>

                  {/* Center text */}
                  <text
                    x={cx}
                    y={cy - 16}
                    textAnchor="middle"
                    fill="#00ff88"
                    fontSize="36"
                    fontWeight="bold"
                    fontFamily="monospace"
                    filter="url(#glowCyan)"
                  >
                    {animatedRate}%
                  </text>
                  <text
                    x={cx}
                    y={cy + 8}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    letterSpacing="1"
                  >
                    COMPLETION RATE
                  </text>
                  <text
                    x={cx}
                    y={cy + 24}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {completed} Completions / {totalTasks} Tasks
                  </text>
                </svg>

                {/* Pulsing ring animation overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, transparent 55%, rgba(0,255,136,0.03) 65%, transparent 75%)`,
                  }}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "#10b981",
                      boxShadow: "0 0 8px #10b98180",
                    }}
                  />
                  <span className="text-sm font-mono text-gray-400">
                    Completed: {rate}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "#ef4444",
                      boxShadow: "0 0 8px #ef444480",
                    }}
                  />
                  <span className="text-sm font-mono text-gray-400">
                    Missed: {missed}%
                  </span>
                </div>
              </div>

              {/* Bottom info line */}
              <p className="text-center text-xs text-emerald-400/40 mt-3 font-mono tracking-wider">
                This Month: {completed} Completions, {Math.max(0, totalTasks - completed)} Missed
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
