"use client";

interface TimerCircleProps {
  timeLeft: number;
  totalDuration: number;
  color?: string;
}

export function TimerCircle({ timeLeft, totalDuration, color = "#6366f1" }: TimerCircleProps) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={280} height={280} className="transform -rotate-90">
        <circle
          cx={140}
          cy={140}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          className="text-muted/20"
        />
        <circle
          cx={140}
          cy={140}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
