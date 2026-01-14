import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function calculateXpForLevel(level: number): number {
  // XP required increases exponentially
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
} {
  let level = 1;
  let xpRemaining = totalXp;

  while (xpRemaining >= calculateXpForLevel(level)) {
    xpRemaining -= calculateXpForLevel(level);
    level++;
  }

  return {
    level,
    currentXp: xpRemaining,
    xpToNextLevel: calculateXpForLevel(level),
  };
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return "👑";
  if (streak >= 100) return "💎";
  if (streak >= 30) return "🔥";
  if (streak >= 7) return "⚡";
  if (streak >= 3) return "✨";
  return "🌱";
}

export function getMoodColor(level: 1 | 2 | 3 | 4 | 5): string {
  const colors = {
    1: "#ef4444", // red
    2: "#f97316", // orange
    3: "#eab308", // yellow
    4: "#84cc16", // lime
    5: "#22c55e", // green
  };
  return colors[level];
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
