export const CATEGORIES = [
  { value: "general", label: "General", color: "#6366f1" },
  { value: "gym", label: "Gym", color: "#ef4444" },
  { value: "study", label: "Study", color: "#3b82f6" },
  { value: "work", label: "Work", color: "#f59e0b" },
  { value: "health", label: "Health", color: "#10b981" },
  { value: "personal", label: "Personal", color: "#8b5cf6" },
  { value: "hobby", label: "Hobby", color: "#ec4899" },
  { value: "finance", label: "Finance", color: "#14b8a6" },
] as const;

export const RECURRENCE_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly (Mon)" },
  { value: "MONTHLY", label: "Monthly (1st)" },
  { value: "CUSTOM_WEEKLY", label: "Custom Weekly" },
  { value: "CUSTOM_MONTHLY", label: "Custom Monthly" },
  { value: "FLEXIBLE_WEEKLY", label: "Flexible Weekly" },
] as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

export function getCategoryColor(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.color ?? "#6366f1";
}

export function getCategoryLabel(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? "General";
}

export const DAILY_QUOTES = {
  champion: [
    "You didn't come this far to only come this far. Keep dominating!",
    "Discipline is choosing between what you want now and what you want most.",
    "Champions aren't made in the gym. They are made from something deep inside — a desire, a dream, a vision.",
    "The only way to prove you're a good sport is to lose.",
    "Success is not final, failure is not fatal — it is the courage to continue that counts.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Great things never come from comfort zones.",
    "Be stronger than your strongest excuse.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Winners never quit, and quitters never win.",
    "You are what you do, not what you say you'll do.",
    "Push yourself because no one else is going to do it for you.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream it. Wish it. Do it.",
    "Stars can't shine without darkness.",
    "Wake up with determination. Go to bed with satisfaction.",
    "It always seems impossible until it's done.",
    "Your limitation — it's only your imagination.",
    "Hard work beats talent when talent doesn't work hard.",
    "You're a beast. Act like one.",
    "Legends aren't born. They are built — one day at a time.",
    "When you feel like quitting, think about why you started.",
    "Hustle in silence. Let your success make the noise.",
    "The best view comes after the hardest climb.",
    "Don't stop when you're tired. Stop when you're done.",
    "Turn your wounds into wisdom.",
    "Every champion was once a contender that refused to give up.",
    "Believe you can and you're halfway there.",
    "Sweat is just fat crying. Keep going!",
    "Today's effort is tomorrow's result.",
  ],
  rising: [
    "You're on the right path — keep moving forward!",
    "Progress, not perfection. You're doing amazing.",
    "Small steps every day lead to big changes.",
    "Believe in yourself and all that you are.",
    "The secret of getting ahead is getting started — and you have.",
    "You don't have to be perfect to be amazing.",
    "Every day is a chance to get better. You're proving it.",
    "One step at a time. One day at a time. You've got this.",
    "Your future self will thank you for the work you're putting in now.",
    "Growth is never by mere chance — it's the result of effort.",
    "Stay patient and trust your journey.",
    "You're closer than you think. Keep pushing.",
    "Success doesn't come from what you do occasionally, but what you do consistently.",
    "A river cuts through rock not because of its power, but its persistence.",
    "Keep going. You're making progress even when you can't see it.",
    "The only bad workout is the one you didn't do.",
    "Don't watch the clock; do what it does — keep going.",
    "You are stronger than you think you are.",
    "Slow progress is still progress. Own it.",
    "If it doesn't challenge you, it doesn't change you.",
    "You are braver than you believe and stronger than you seem.",
    "Fall seven times, stand up eight.",
    "The comeback is always stronger than the setback.",
    "Keep your eyes on the stars, and your feet on the ground.",
    "A little progress each day adds up to big results.",
    "Energy and persistence conquer all things.",
    "You're not where you want to be, but you're not where you used to be.",
    "Difficult roads often lead to beautiful destinations.",
    "What seems impossible today will become your warm-up tomorrow.",
    "Stay focused, stay humble, stay hungry.",
    "The grind doesn't stop just because it's hard.",
  ],
  building: [
    "Every expert was once a beginner. Keep going.",
    "The journey of a thousand miles begins with a single step — and you've taken it.",
    "You're building something great. Don't stop now.",
    "Rome wasn't built in a day, but they were laying bricks every hour.",
    "It's not about being the best. It's about being better than you were yesterday.",
    "Start where you are. Use what you have. Do what you can.",
    "Good things take time. Be patient with yourself.",
    "You've already started — that's the hardest part.",
    "A journey of a thousand miles begins with a single step.",
    "Consistency is the key to mastery.",
    "You are making progress. Trust the process.",
    "The only impossible journey is the one you never begin.",
    "What you plant now, you will harvest later.",
    "Success is built one day at a time.",
    "Action is the foundational key to all success.",
    "Little by little, day by day, you'll get there.",
    "The best time to start was yesterday. The next best time is now.",
    "Your only limit is you. Break through.",
    "Even the longest journey starts with a single step forward.",
    "Momentum is everything. Keep building it.",
    "Don't compare your chapter 1 to someone else's chapter 20.",
    "The beginning is always the hardest. You're past it.",
    "Brick by brick. That's how champions are built.",
    "Showing up is half the battle — and you showed up.",
    "You're planting seeds that will bloom into something incredible.",
    "Great oaks grow from little acorns.",
    "Focus on progress, not perfection.",
    "Your habits today create your future tomorrow.",
    "Small daily improvements are the key to long-term results.",
    "Trust the journey even when you don't understand it.",
    "You haven't come this far to only come this far.",
  ],
  starting: [
    "Don't give up, you can do it! Start small — one photo today makes a difference.",
    "The hardest part is starting. You've already begun — don't stop now.",
    "Every master was once a disaster. Keep showing up.",
    "You don't have to be great to start, but you have to start to be great.",
    "Tough times never last, but tough people do.",
    "Failure is not the opposite of success — it's part of success.",
    "Your present situation is not your final destination.",
    "The only person you should try to be better than is who you were yesterday.",
    "Storms don't last forever. Keep going.",
    "It's okay to be a work in progress.",
    "Rise up. Start fresh. See the bright opportunity in each new day.",
    "Don't wait for motivation. Just begin — motivation follows action.",
    "You are never too old to set another goal or dream a new dream.",
    "Sometimes the bravest thing you can do is just show up.",
    "A diamond is just a piece of coal that handled stress exceptionally well.",
    "Today is a new day. A new chance. Make it count.",
    "Courage doesn't always roar. Sometimes it's the quiet voice saying 'I'll try again tomorrow.'",
    "You haven't failed until you stop trying.",
    "No matter how slow you go, you're still lapping everyone on the couch.",
    "Be gentle with yourself. You're doing the best you can.",
    "One day or day one. You decide.",
    "The fact that you're trying means you're already winning.",
    "Don't let a bad day make you feel like you have a bad life.",
    "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward.",
    "Every day is a second chance.",
    "When everything seems to be going against you, remember that airplanes take off against the wind.",
    "You are enough. You have enough. You do enough.",
    "Your only competition is who you were yesterday.",
    "Keep going. The reward is worth the struggle.",
    "Believe in yourself even when no one else does.",
    "The comeback is always possible. Start today.",
  ],
} as const;

export function getDailyQuote(tierId: string): string {
  const quotes = DAILY_QUOTES[tierId as keyof typeof DAILY_QUOTES];
  if (!quotes) return "Keep going!";

  // Use day-of-year as index so quote changes daily but is consistent throughout the day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  return quotes[dayOfYear % quotes.length];
}

export const MOTIVATION_TIERS = [
  {
    id: "champion",
    minPercent: 85,
    label: "Champion",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    progressColor: "bg-green-500",
    showVideo: true,
  },
  {
    id: "rising",
    minPercent: 50,
    label: "Rising Star",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    progressColor: "bg-blue-500",
    showVideo: false,
  },
  {
    id: "building",
    minPercent: 25,
    label: "Building Momentum",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    progressColor: "bg-amber-500",
    showVideo: false,
  },
  {
    id: "starting",
    minPercent: 0,
    label: "Getting Started",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    progressColor: "bg-red-500",
    showVideo: false,
  },
] as const;

export const MOTIVATIONAL_VIDEOS = [
  { id: "ZXsQAXx_ao0", title: "Motivational Speech - Never Give Up" },
  { id: "mgmVOuLgFB0", title: "Dream - Motivational Video" },
  { id: "g-jwWYX7Jlo", title: "Rise and Grind" },
] as const;

export function getMotivationTier(percent: number) {
  return (
    MOTIVATION_TIERS.find((t) => percent >= t.minPercent) ??
    MOTIVATION_TIERS[MOTIVATION_TIERS.length - 1]
  );
}
