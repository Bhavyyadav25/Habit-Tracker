// Habit types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: "daily" | "weekly" | "custom";
  customDays?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  targetCount: number;
  createdAt: string;
  archived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  count: number;
  notes?: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  todayCount: number;
  totalCompletions: number;
}

// Mood types
export interface MoodEntry {
  id: string;
  moodLevel: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  journal?: string;
  tags: string[];
  createdAt: string;
}

export type MoodEmoji = {
  level: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
  color: string;
};

// Pomodoro types
export interface PomodoroSession {
  id: string;
  habitId?: string;
  duration: number;
  type: "work" | "short_break" | "long_break";
  completed: boolean;
  startedAt: string;
  endedAt?: string;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

// Screen time types
export interface ScreenTimeEntry {
  id: string;
  appName: string;
  windowTitle: string;
  duration: number;
  date: string;
}

export interface ScreenTimeStats {
  totalTime: number;
  byApp: { appName: string; duration: number }[];
  byCategory: { category: string; duration: number }[];
}

// Achievement types
export interface Achievement {
  id: string;
  type: AchievementType;
  unlockedAt: string;
  data?: Record<string, unknown>;
}

export type AchievementType =
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "streak_365"
  | "first_habit"
  | "habits_5"
  | "habits_10"
  | "perfect_week"
  | "perfect_month"
  | "mood_streak_7"
  | "pomodoro_10"
  | "pomodoro_50"
  | "pomodoro_100"
  | "early_bird"
  | "night_owl"
  | "level_5"
  | "level_10"
  | "level_25"
  | "level_50";

export interface AchievementDefinition {
  id: AchievementType;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

// Gamification types
export interface UserStats {
  level: number;
  currentXp: number;
  totalXp: number;
  xpToNextLevel: number;
}

// Color theme type
export type ColorTheme = "default" | "ocean" | "forest" | "sunset" | "midnight" | "aurora" | "neon";

// Sound pack type
export type SoundPack = "default" | "chime" | "nature" | "gaming";

// Settings types
export interface AppSettings {
  theme: "light" | "dark" | "system";
  colorTheme: ColorTheme;
  soundPack: SoundPack;
  soundEnabled: boolean;
  notifications: NotificationSettings;
  pomodoro: PomodoroSettings;
  ai: AISettings;
  breakReminders: BreakReminderSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  habitReminders: boolean;
  breakReminders: boolean;
  pomodoroAlerts: boolean;
  dailySummary: boolean;
  dailySummaryTime: string;
}

export interface BreakReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  hydrationReminder: boolean;
  stretchReminder: boolean;
  eyeRestReminder: boolean;
}

export interface AISettings {
  provider: "ollama" | "openai" | "claude" | "none";
  ollamaModel: string;
  ollamaEndpoint: string;
  openaiApiKey?: string;
  claudeApiKey?: string;
  enableInsights: boolean;
  enableCoach: boolean;
}

// Navigation
export type Page =
  | "dashboard"
  | "habits"
  | "mood"
  | "pomodoro"
  | "stats"
  | "achievements"
  | "ai"
  | "settings";
