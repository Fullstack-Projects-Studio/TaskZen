"use client";

import Link from "next/link";
import {
  ListTodo,
  CalendarDays,
  Timer,
  BookOpen,
  Clock,
  Trophy,
  LayoutDashboard,
  Settings,
  CheckSquare,
  Sparkles,
  Target,
  TrendingUp,
  Check,
  Play,
  Pause,
  RotateCcw,
  Star,
  Award,
  Zap,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { AboutNavbar } from "@/components/about/about-navbar";
import { AboutFooter } from "@/components/about/about-footer";
import { FeatureSection } from "@/components/about/feature-section";
import { ScrollFadeIn } from "@/components/animations";

// ─── Hero Section ────────────────────────────────────────────────
function HeroSection() {
  const floatingIcons = [
    { icon: ListTodo, color: "text-blue-500", delay: 0 },
    { icon: CalendarDays, color: "text-green-500", delay: 0.1 },
    { icon: Timer, color: "text-orange-500", delay: 0.2 },
    { icon: BookOpen, color: "text-purple-500", delay: 0.3 },
    { icon: Trophy, color: "text-yellow-500", delay: 0.4 },
    { icon: LayoutDashboard, color: "text-indigo-500", delay: 0.5 },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-32">
      {/* Floating icon grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
        <div className="grid grid-cols-3 gap-12">
          {floatingIcons.map(({ icon: Icon, delay }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 3,
              }}
            >
              <Icon className="h-16 w-16 md:h-24 md:w-24" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hero content */}
      <div className="relative mx-auto max-w-3xl text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
        >
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Your all-in-one productivity companion
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight md:text-6xl"
        >
          Organize your life with{" "}
          <span className="text-primary">TaskZen</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground md:text-xl"
        >
          Tasks, calendars, focus timers, reflections, routines, and
          gamification — all in one beautiful app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <Link
            href="/signup"
            className={buttonVariants({ size: "lg" })}
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Log In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Illustration: Task Cards ────────────────────────────────────
function TaskCardsIllustration() {
  const tasks = [
    { text: "Design landing page", category: "Work", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", done: true },
    { text: "Morning workout", category: "Health", color: "bg-green-500/10 text-green-600 dark:text-green-400", done: true },
    { text: "Read 30 minutes", category: "Personal", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", done: false },
    { text: "Review pull requests", category: "Work", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", done: false },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Today&apos;s Tasks</span>
        <span className="text-xs text-muted-foreground">2/4 done</span>
      </div>
      {tasks.map((task) => (
        <div
          key={task.text}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <div
            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${
              task.done
                ? "bg-primary border-primary"
                : "border-muted-foreground/30"
            }`}
          >
            {task.done && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span
            className={`flex-1 text-sm ${
              task.done ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.text}
          </span>
          <span className={`text-xs rounded-full px-2 py-0.5 ${task.color}`}>
            {task.category}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Illustration: Mini Calendar ─────────────────────────────────
function MiniCalendarIllustration() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const completedDays = [1, 2, 3, 5, 6, 8, 10, 11, 12, 14, 15, 17, 19, 20];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">March 2026</span>
        <span className="text-xs text-muted-foreground">
          {completedDays.length}/{days.length} days
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`h-${i}`} className="text-[10px] text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {/* Offset for starting day (Sunday = 0) */}
        <div />
        {days.map((day) => (
          <div
            key={day}
            className={`h-7 w-7 rounded-md flex items-center justify-center text-xs ${
              completedDays.includes(day)
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {completedDays.includes(day) ? (
              <Check className="h-3 w-3" />
            ) : (
              day
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Illustration: Focus Timer ───────────────────────────────────
function FocusTimerIllustration() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center gap-4">
      <span className="text-sm font-medium">Focus Session</span>
      <div className="relative h-36 w-36">
        {/* Background ring */}
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/50"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray="264"
            strokeDashoffset="66"
            strokeLinecap="round"
            className="text-orange-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">18:42</span>
          <span className="text-xs text-muted-foreground">remaining</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
          <Pause className="h-5 w-5 text-white" />
        </div>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <Play className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

// ─── Illustration: Reflection Journal ────────────────────────────
function ReflectionIllustration() {
  const moods = [
    { emoji: "😊", label: "Great" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😔", label: "Low" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <span className="text-sm font-medium">Daily Reflection</span>
      <div>
        <span className="text-xs text-muted-foreground mb-2 block">
          How are you feeling?
        </span>
        <div className="flex gap-2">
          {moods.map((mood) => (
            <div
              key={mood.label}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center cursor-default ${
                mood.label === "Great"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-border"
              }`}
            >
              <span className="text-lg">{mood.emoji}</span>
              <span className="text-[10px] text-muted-foreground">
                {mood.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs text-muted-foreground mb-1 block">
          What went well today?
        </span>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground italic">
          Finished the landing page design and had a productive focus session...
        </div>
      </div>
    </div>
  );
}

// ─── Illustration: Routine Timeline ──────────────────────────────
function RoutineIllustration() {
  const blocks = [
    { label: "Sleep", start: 0, width: "29%", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
    { label: "Morning", start: "29%", width: "8%", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
    { label: "Work", start: "37%", width: "33%", color: "bg-red-500/20 text-red-600 dark:text-red-400" },
    { label: "Free", start: "70%", width: "17%", color: "bg-green-500/20 text-green-600 dark:text-green-400" },
    { label: "Wind Down", start: "87%", width: "13%", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Daily Routine</span>
        <span className="text-xs text-muted-foreground">24h overview</span>
      </div>
      {/* Timeline bar */}
      <div className="relative h-10 rounded-full bg-muted/50 overflow-hidden flex">
        {blocks.map((block) => (
          <div
            key={block.label}
            className={`h-full flex items-center justify-center text-[10px] font-medium ${block.color}`}
            style={{ width: block.width }}
          >
            <span className="hidden sm:inline">{block.label}</span>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {blocks.map((block) => (
          <div key={block.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${block.color.split(" ")[0]}`} />
            <span className="text-xs text-muted-foreground">{block.label}</span>
          </div>
        ))}
      </div>
      {/* Schedule items */}
      <div className="space-y-2">
        {[
          { time: "6:00 AM", label: "Wake up", icon: Sun },
          { time: "9:00 AM", label: "Deep work block", icon: Target },
          { time: "10:00 PM", label: "Bedtime", icon: Moon },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <item.icon className="h-3.5 w-3.5" />
            <span className="text-xs font-mono">{item.time}</span>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Illustration: Gamification ──────────────────────────────────
function GamificationIllustration() {
  const badges = [
    { icon: Zap, label: "First Task", color: "text-yellow-500 bg-yellow-500/10" },
    { icon: Target, label: "Week Streak", color: "text-red-500 bg-red-500/10" },
    { icon: Star, label: "Focus Pro", color: "text-orange-500 bg-orange-500/10" },
    { icon: Award, label: "Reflector", color: "text-purple-500 bg-purple-500/10" },
    { icon: TrendingUp, label: "Level 5", color: "text-green-500 bg-green-500/10" },
    { icon: Trophy, label: "Champion", color: "text-yellow-600 bg-yellow-500/10" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Level 12</span>
        <span className="text-xs text-muted-foreground">2,450 / 3,000 XP</span>
      </div>
      {/* XP bar */}
      <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
          style={{ width: "82%" }}
        />
      </div>
      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-2">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-2"
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${badge.color}`}>
              <badge.icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] text-muted-foreground text-center">
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Illustration: Dashboard Stats ───────────────────────────────
function DashboardIllustration() {
  const stats = [
    { label: "Tasks Done", value: "127", change: "+12%", color: "text-blue-500" },
    { label: "Focus Hours", value: "48h", change: "+8%", color: "text-orange-500" },
    { label: "Day Streak", value: "14", change: "+1", color: "text-green-500" },
    { label: "XP Earned", value: "2.4k", change: "+350", color: "text-yellow-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <span className="text-xs text-muted-foreground">{stat.label}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-xs text-green-500">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Illustration: Settings ──────────────────────────────────────
function SettingsIllustration() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <span className="text-sm font-medium">Preferences</span>
      {/* Theme selector */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Theme</span>
        <div className="flex gap-2">
          {[
            { label: "Light", icon: Sun, active: false },
            { label: "Dark", icon: Moon, active: true },
            { label: "System", icon: Settings, active: false },
          ].map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
                opt.active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </div>
          ))}
        </div>
      </div>
      {/* Notification toggles */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Notifications</span>
        {[
          { label: "Daily reminders", enabled: true },
          { label: "Focus alerts", enabled: true },
          { label: "Weekly summary", enabled: false },
        ].map((toggle) => (
          <div
            key={toggle.label}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs">{toggle.label}</span>
            </div>
            <div
              className={`h-5 w-9 rounded-full relative ${
                toggle.enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  toggle.enabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────
function CTASection() {
  return (
    <ScrollFadeIn>
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Take Control?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join TaskZen and start building better habits, staying focused, and
            achieving your goals — one day at a time.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg" })}
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </ScrollFadeIn>
  );
}

// ─── Feature Data ────────────────────────────────────────────────
const features = [
  {
    title: "Task Management",
    description:
      "Create, organize, and track your daily tasks with categories, priorities, and satisfying completion animations.",
    highlights: [
      "Organize tasks by custom categories",
      "Track completion with visual progress",
      "Animated checkmarks for motivation",
      "Daily task overview at a glance",
    ],
    icon: ListTodo,
    iconColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    illustration: <TaskCardsIllustration />,
  },
  {
    title: "Monthly Calendar",
    description:
      "Visualize your productivity across the month. See which days you crushed it and where you can improve.",
    highlights: [
      "Monthly streak visualization",
      "Day-by-day task completion tracking",
      "Photo gallery for memories",
      "Quick overview of productive days",
    ],
    icon: CalendarDays,
    iconColor: "bg-green-500/10 text-green-600 dark:text-green-400",
    illustration: <MiniCalendarIllustration />,
  },
  {
    title: "Focus Timer",
    description:
      "Stay in the zone with a beautiful Pomodoro-style focus timer. Track your deep work sessions and build focus habits.",
    highlights: [
      "Customizable focus & break durations",
      "Visual circular progress timer",
      "Session history and statistics",
      "Ambient mode for distraction-free work",
    ],
    icon: Timer,
    iconColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    illustration: <FocusTimerIllustration />,
  },
  {
    title: "Reflections",
    description:
      "End each day with a mindful reflection. Track your mood, journal your thoughts, and grow self-awareness over time.",
    highlights: [
      "Mood tracking with emoji selector",
      "Guided journal prompts",
      "Reflection history calendar",
      "Spot patterns in your wellbeing",
    ],
    icon: BookOpen,
    iconColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    illustration: <ReflectionIllustration />,
  },
  {
    title: "Routine Planner",
    description:
      "Design your ideal day with a visual timeline. Set wake/sleep times, block out busy periods, and protect your free time.",
    highlights: [
      "Color-coded daily timeline",
      "Wake and sleep time scheduling",
      "Block out work, exercise, and rest",
      "See your day at a glance",
    ],
    icon: Clock,
    iconColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    illustration: <RoutineIllustration />,
  },
  {
    title: "Gamification",
    description:
      "Level up as you complete tasks and build streaks. Earn XP, unlock badges, and make productivity feel like a game.",
    highlights: [
      "XP system with level progression",
      "Achievement badges to collect",
      "Streak rewards and bonuses",
      "Leaderboard motivation",
    ],
    icon: Trophy,
    iconColor: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    illustration: <GamificationIllustration />,
  },
  {
    title: "Dashboard",
    description:
      "Get a bird's-eye view of your productivity. See tasks done, focus hours, streaks, and XP — all in one place.",
    highlights: [
      "Key metrics at a glance",
      "Progress trends over time",
      "Quick access to all features",
      "Personalized productivity insights",
    ],
    icon: LayoutDashboard,
    iconColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    illustration: <DashboardIllustration />,
  },
  {
    title: "Settings",
    description:
      "Make TaskZen yours. Choose your theme, configure notifications, and tailor the experience to your workflow.",
    highlights: [
      "Light, dark, and system themes",
      "Notification preferences",
      "Profile customization",
      "Data and privacy controls",
    ],
    icon: Settings,
    iconColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    illustration: <SettingsIllustration />,
  },
];

// ─── Main Page ───────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <AboutNavbar />

      <HeroSection />

      <div className="mx-auto max-w-5xl space-y-0">
        {features.map((feature, index) => (
          <section
            key={feature.title}
            className={`px-4 py-16 md:py-20 ${
              index % 2 === 1 ? "bg-muted/30" : ""
            }`}
          >
            <FeatureSection
              title={feature.title}
              description={feature.description}
              highlights={feature.highlights}
              icon={feature.icon}
              iconColor={feature.iconColor}
              reversed={index % 2 === 1}
              illustrationSlot={feature.illustration}
            />
          </section>
        ))}
      </div>

      <CTASection />

      <AboutFooter />
    </>
  );
}
