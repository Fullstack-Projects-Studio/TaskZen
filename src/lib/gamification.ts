export const XP_PER_COMPLETION = 10;
export const STREAK_BONUS_THRESHOLD = 7;
export const STREAK_BONUS_MULTIPLIER = 2;

// Level thresholds: exponential curve
export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  850,  // Level 5
  1300, // Level 6
  1850, // Level 7
  2500, // Level 8
  3300, // Level 9
  4200, // Level 10
  5200, // Level 11
  6400, // Level 12
  7800, // Level 13
  9400, // Level 14
  11200,// Level 15
];

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 2000;
  return LEVEL_THRESHOLDS[level]; // level is 1-indexed, threshold[level] is next level threshold
}

export function getXPProgress(xp: number, level: number): { current: number; needed: number; percent: number } {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = getXPForNextLevel(level);
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const percent = needed > 0 ? Math.min(Math.round((current / needed) * 100), 100) : 100;
  return { current, needed, percent };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: { totalCompletions: number; bestStreak: number; level: number; xp: number }) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first task",
    icon: "footprints",
    condition: (s) => s.totalCompletions >= 1,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Achieve a 7-day streak",
    icon: "sword",
    condition: (s) => s.bestStreak >= 7,
  },
  {
    id: "fortnight-focus",
    name: "Fortnight Focus",
    description: "Achieve a 14-day streak",
    icon: "target",
    condition: (s) => s.bestStreak >= 14,
  },
  {
    id: "month-master",
    name: "Month Master",
    description: "Achieve a 30-day streak",
    icon: "crown",
    condition: (s) => s.bestStreak >= 30,
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "Complete 100 tasks",
    icon: "shield",
    condition: (s) => s.totalCompletions >= 100,
  },
  {
    id: "rising-star",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "star",
    condition: (s) => s.level >= 5,
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Reach Level 10",
    icon: "medal",
    condition: (s) => s.level >= 10,
  },
  {
    id: "xp-hoarder",
    name: "XP Hoarder",
    description: "Earn 1,000 XP",
    icon: "gem",
    condition: (s) => s.xp >= 1000,
  },
];
