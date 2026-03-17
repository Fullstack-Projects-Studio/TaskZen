/**
 * Free time calculation engine.
 * Takes wakeUp, sleep times and schedule blocks, returns free time slots.
 */

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface ScheduleBlockData {
  label: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  days: number[];    // 0-6
  type: string;
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string;   // HH:MM
  duration: number; // minutes
  type: "sleep" | "busy" | "free";
  label?: string;
}

export interface FreeTimeResult {
  awakeHours: number;
  busyHours: number;
  freeHours: number;
  slots: TimeSlot[];
}

export function calculateFreeTime(
  wakeUpTime: string | null,
  sleepTime: string | null,
  blocks: ScheduleBlockData[],
  dayOfWeek: number // 0-6, Sunday=0
): FreeTimeResult {
  const wake = wakeUpTime || "06:00";
  const sleep = sleepTime || "22:00";
  const wakeMin = timeToMinutes(wake);
  const sleepMin = timeToMinutes(sleep);

  const awakeMinutes = sleepMin > wakeMin ? sleepMin - wakeMin : (24 * 60 - wakeMin) + sleepMin;

  // Filter blocks applicable to this day
  const todayBlocks = blocks
    .filter((b) => b.days.includes(dayOfWeek))
    .map((b) => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
      label: b.label,
      type: b.type,
    }))
    .filter((b) => {
      // Only include blocks within awake hours
      return b.start >= wakeMin && b.end <= sleepMin;
    })
    .sort((a, b) => a.start - b.start);

  // Calculate busy time
  let busyMinutes = 0;
  const mergedBlocks: typeof todayBlocks = [];

  for (const block of todayBlocks) {
    if (mergedBlocks.length === 0 || block.start > mergedBlocks[mergedBlocks.length - 1].end) {
      mergedBlocks.push({ ...block });
    } else {
      const last = mergedBlocks[mergedBlocks.length - 1];
      last.end = Math.max(last.end, block.end);
      last.label = `${last.label}, ${block.label}`;
    }
  }

  for (const block of mergedBlocks) {
    busyMinutes += block.end - block.start;
  }

  const freeMinutes = awakeMinutes - busyMinutes;

  // Build timeline slots
  const slots: TimeSlot[] = [];

  // Sleep before wake
  if (wakeMin > 0) {
    slots.push({
      start: "00:00",
      end: wake,
      duration: wakeMin,
      type: "sleep",
      label: "Sleep",
    });
  }

  // Awake time with busy/free blocks
  let cursor = wakeMin;
  for (const block of mergedBlocks) {
    if (cursor < block.start) {
      slots.push({
        start: minutesToTime(cursor),
        end: minutesToTime(block.start),
        duration: block.start - cursor,
        type: "free",
        label: "Free Time",
      });
    }
    slots.push({
      start: minutesToTime(block.start),
      end: minutesToTime(block.end),
      duration: block.end - block.start,
      type: "busy",
      label: block.label,
    });
    cursor = block.end;
  }

  if (cursor < sleepMin) {
    slots.push({
      start: minutesToTime(cursor),
      end: sleep,
      duration: sleepMin - cursor,
      type: "free",
      label: "Free Time",
    });
  }

  // Sleep after sleep time
  if (sleepMin < 24 * 60) {
    slots.push({
      start: sleep,
      end: "24:00",
      duration: 24 * 60 - sleepMin,
      type: "sleep",
      label: "Sleep",
    });
  }

  return {
    awakeHours: Math.round((awakeMinutes / 60) * 10) / 10,
    busyHours: Math.round((busyMinutes / 60) * 10) / 10,
    freeHours: Math.round((freeMinutes / 60) * 10) / 10,
    slots,
  };
}
