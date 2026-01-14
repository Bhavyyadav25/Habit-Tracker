import type { MoodEmoji, AchievementDefinition, PomodoroSettings } from "@/types";

export const MOOD_EMOJIS: MoodEmoji[] = [
  { level: 1, emoji: "😢", label: "Terrible", color: "#ef4444" },
  { level: 2, emoji: "😕", label: "Bad", color: "#f97316" },
  { level: 3, emoji: "😐", label: "Okay", color: "#eab308" },
  { level: 4, emoji: "🙂", label: "Good", color: "#84cc16" },
  { level: 5, emoji: "😄", label: "Great", color: "#22c55e" },
];

export const HABIT_ICONS = [
  "💪", "📚", "🏃", "💧", "🧘", "💤", "🥗", "💊",
  "✍️", "🎯", "🧠", "🎨", "🎸", "🌱", "🧹", "💰",
  "📱", "🚭", "🍎", "🏋️", "🚴", "🧪", "📝", "🎓",
];

export const HABIT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#0ea5e9", // sky
  "#3b82f6", // blue
];

export const EMOTION_TAGS = [
  "Productive", "Stressed", "Relaxed", "Anxious", "Focused",
  "Tired", "Energetic", "Creative", "Frustrated", "Grateful",
  "Motivated", "Overwhelmed", "Peaceful", "Excited", "Bored",
];

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60, // 25 minutes in seconds
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Streak achievements
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", xpReward: 50 },
  { id: "streak_30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "⚡", xpReward: 200 },
  { id: "streak_100", name: "Century Champion", description: "Maintain a 100-day streak", icon: "💎", xpReward: 500 },
  { id: "streak_365", name: "Year Legend", description: "Maintain a 365-day streak", icon: "👑", xpReward: 2000 },

  // Habit achievements
  { id: "first_habit", name: "First Step", description: "Create your first habit", icon: "🌱", xpReward: 10 },
  { id: "habits_5", name: "Habit Builder", description: "Create 5 habits", icon: "🏗️", xpReward: 50 },
  { id: "habits_10", name: "Habit Master", description: "Create 10 habits", icon: "🎯", xpReward: 100 },

  // Consistency achievements
  { id: "perfect_week", name: "Perfect Week", description: "Complete all habits for 7 days", icon: "🌟", xpReward: 100 },
  { id: "perfect_month", name: "Perfect Month", description: "Complete all habits for 30 days", icon: "🏆", xpReward: 500 },

  // Mood tracking
  { id: "mood_streak_7", name: "Self-Aware", description: "Log your mood for 7 days straight", icon: "🧠", xpReward: 30 },

  // Pomodoro achievements
  { id: "pomodoro_10", name: "Focus Finder", description: "Complete 10 Pomodoro sessions", icon: "🍅", xpReward: 30 },
  { id: "pomodoro_50", name: "Focus Fighter", description: "Complete 50 Pomodoro sessions", icon: "⏱️", xpReward: 100 },
  { id: "pomodoro_100", name: "Focus Legend", description: "Complete 100 Pomodoro sessions", icon: "🎖️", xpReward: 250 },

  // Time-based
  { id: "early_bird", name: "Early Bird", description: "Complete a habit before 6 AM", icon: "🌅", xpReward: 25 },
  { id: "night_owl", name: "Night Owl", description: "Complete a habit after midnight", icon: "🦉", xpReward: 25 },

  // Level achievements
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "⭐", xpReward: 0 },
  { id: "level_10", name: "Dedicated", description: "Reach level 10", icon: "🌟", xpReward: 0 },
  { id: "level_25", name: "Committed", description: "Reach level 25", icon: "💫", xpReward: 0 },
  { id: "level_50", name: "Lifestyle Master", description: "Reach level 50", icon: "✨", xpReward: 0 },
];

export const XP_REWARDS = {
  habitComplete: 10,
  streakBonus: 5, // Per streak day (capped at 50)
  moodLog: 5,
  pomodoroComplete: 15,
  journalEntry: 10,
};

export const BREAK_REMINDER_MESSAGES = {
  hydration: [
    "Time for a water break! 💧",
    "Stay hydrated! Grab some water 🚰",
    "Your body needs water. Take a sip! 💦",
  ],
  stretch: [
    "Stand up and stretch! 🧘",
    "Time to move your body! 🏃",
    "Take a quick stretch break 💪",
  ],
  eyeRest: [
    "Look away from the screen for 20 seconds 👀",
    "Give your eyes a break! Look at something 20 feet away 🌳",
    "20-20-20 rule: Look 20 feet away for 20 seconds 👁️",
  ],
};

// Level-based unlocks
export interface LevelUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  type: "theme" | "icons" | "template" | "sound" | "feature" | "badge";
}

export const LEVEL_UNLOCKS: LevelUnlock[] = [
  // Level 3 - First unlock
  { id: "theme_ocean", name: "Ocean Theme", description: "Cool blue oceanic color scheme", icon: "🌊", levelRequired: 3, type: "theme" },

  // Level 5
  { id: "icons_fitness", name: "Fitness Icons", description: "Extra fitness & workout emojis", icon: "🏋️", levelRequired: 5, type: "icons" },
  { id: "badge_starter", name: "Starter Badge", description: "Display badge on your profile", icon: "🎖️", levelRequired: 5, type: "badge" },

  // Level 8
  { id: "theme_forest", name: "Forest Theme", description: "Calm green nature colors", icon: "🌲", levelRequired: 8, type: "theme" },
  { id: "template_morning", name: "Morning Routine", description: "Pre-made morning habit pack", icon: "🌅", levelRequired: 8, type: "template" },

  // Level 10
  { id: "sound_chime", name: "Chime Sounds", description: "Gentle chime completion sounds", icon: "🔔", levelRequired: 10, type: "sound" },
  { id: "icons_productivity", name: "Productivity Icons", description: "Work & productivity emojis", icon: "💼", levelRequired: 10, type: "icons" },
  { id: "badge_dedicated", name: "Dedicated Badge", description: "Show your commitment", icon: "⭐", levelRequired: 10, type: "badge" },

  // Level 15
  { id: "theme_sunset", name: "Sunset Theme", description: "Warm orange & pink gradient", icon: "🌅", levelRequired: 15, type: "theme" },
  { id: "template_fitness", name: "Fitness Pack", description: "Complete workout habit set", icon: "💪", levelRequired: 15, type: "template" },
  { id: "feature_widgets", name: "Dashboard Widgets", description: "Customizable mini widgets", icon: "📊", levelRequired: 15, type: "feature" },

  // Level 20
  { id: "theme_midnight", name: "Midnight Theme", description: "Deep AMOLED black theme", icon: "🌙", levelRequired: 20, type: "theme" },
  { id: "sound_nature", name: "Nature Sounds", description: "Birds, water, wind sounds", icon: "🍃", levelRequired: 20, type: "sound" },
  { id: "template_mindfulness", name: "Mindfulness Pack", description: "Meditation & wellness habits", icon: "🧘", levelRequired: 20, type: "template" },
  { id: "feature_export", name: "Advanced Export", description: "Export to PDF with charts", icon: "📄", levelRequired: 20, type: "feature" },

  // Level 25
  { id: "icons_nature", name: "Nature Icons", description: "Plants, animals, weather emojis", icon: "🌿", levelRequired: 25, type: "icons" },
  { id: "badge_committed", name: "Committed Badge", description: "Elite commitment badge", icon: "💎", levelRequired: 25, type: "badge" },
  { id: "template_developer", name: "Developer Pack", description: "Habits for programmers", icon: "👨‍💻", levelRequired: 25, type: "template" },

  // Level 30
  { id: "theme_aurora", name: "Aurora Theme", description: "Northern lights gradient", icon: "✨", levelRequired: 30, type: "theme" },
  { id: "sound_gaming", name: "Gaming Sounds", description: "Retro game-style sounds", icon: "🎮", levelRequired: 30, type: "sound" },
  { id: "feature_api", name: "API Access", description: "Connect to external services", icon: "🔌", levelRequired: 30, type: "feature" },

  // Level 40
  { id: "theme_neon", name: "Neon Theme", description: "Cyberpunk neon colors", icon: "💜", levelRequired: 40, type: "theme" },
  { id: "icons_premium", name: "Premium Icons", description: "Exclusive icon collection", icon: "👑", levelRequired: 40, type: "icons" },
  { id: "template_master", name: "Master Collection", description: "All habit templates", icon: "📚", levelRequired: 40, type: "template" },

  // Level 50
  { id: "theme_custom", name: "Custom Theme", description: "Create your own color scheme", icon: "🎨", levelRequired: 50, type: "theme" },
  { id: "badge_master", name: "Lifestyle Master", description: "Ultimate achievement badge", icon: "👑", levelRequired: 50, type: "badge" },
  { id: "feature_all", name: "All Features", description: "Unlock everything forever", icon: "🌟", levelRequired: 50, type: "feature" },
];

// Unlockable themes
export const UNLOCKABLE_THEMES = {
  default: {
    id: "default",
    name: "Default",
    levelRequired: 0,
    colors: {
      primary: "#6366f1",
      accent: "#8b5cf6",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    levelRequired: 3,
    colors: {
      primary: "#0ea5e9",
      accent: "#06b6d4",
    },
  },
  forest: {
    id: "forest",
    name: "Forest",
    levelRequired: 8,
    colors: {
      primary: "#22c55e",
      accent: "#16a34a",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    levelRequired: 15,
    colors: {
      primary: "#f97316",
      accent: "#ec4899",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    levelRequired: 20,
    colors: {
      primary: "#6366f1",
      accent: "#8b5cf6",
      bgPrimary: "#000000",
      bgSecondary: "#0a0a0a",
    },
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    levelRequired: 30,
    colors: {
      primary: "#10b981",
      accent: "#8b5cf6",
    },
  },
  neon: {
    id: "neon",
    name: "Neon",
    levelRequired: 40,
    colors: {
      primary: "#d946ef",
      accent: "#06b6d4",
    },
  },
};

// Unlockable icon packs
export const ICON_PACKS = {
  default: {
    id: "default",
    name: "Default",
    levelRequired: 0,
    icons: ["💪", "📚", "🏃", "💧", "🧘", "💤", "🥗", "💊", "✍️", "🎯", "🧠", "🎨", "🎸", "🌱", "🧹", "💰", "📱", "🚭", "🍎", "🏋️", "🚴", "🧪", "📝", "🎓"],
  },
  fitness: {
    id: "fitness",
    name: "Fitness",
    levelRequired: 5,
    icons: ["🏃‍♂️", "🏃‍♀️", "🚶", "🧗", "🤸", "⛹️", "🏊", "🚣", "🧘‍♀️", "🧘‍♂️", "🏌️", "🏇", "⚽", "🏀", "🎾", "🏐"],
  },
  productivity: {
    id: "productivity",
    name: "Productivity",
    levelRequired: 10,
    icons: ["💻", "📊", "📈", "📅", "⏰", "📋", "✅", "📌", "🎯", "💡", "🔔", "📧", "💬", "🗂️", "📁", "🔗"],
  },
  nature: {
    id: "nature",
    name: "Nature",
    levelRequired: 25,
    icons: ["🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "🍀", "🌿", "🌴", "🌵", "🦋", "🐝", "🌈", "☀️", "🌙", "⭐"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    levelRequired: 40,
    icons: ["💎", "👑", "🏆", "🎖️", "🥇", "🌟", "✨", "💫", "🔮", "🎭", "🎪", "🎢", "🚀", "🛸", "🌌", "🎇"],
  },
};

// Habit templates
export const HABIT_TEMPLATES = {
  morning: {
    id: "morning",
    name: "Morning Routine",
    description: "Start your day right",
    levelRequired: 8,
    icon: "🌅",
    habits: [
      { name: "Wake up early", icon: "⏰", color: "#f97316" },
      { name: "Drink water", icon: "💧", color: "#0ea5e9" },
      { name: "Stretch", icon: "🧘", color: "#22c55e" },
      { name: "Healthy breakfast", icon: "🥗", color: "#84cc16" },
      { name: "Plan the day", icon: "📝", color: "#6366f1" },
    ],
  },
  fitness: {
    id: "fitness",
    name: "Fitness Journey",
    description: "Get in shape",
    levelRequired: 15,
    icon: "💪",
    habits: [
      { name: "Workout", icon: "🏋️", color: "#ef4444" },
      { name: "10k steps", icon: "🚶", color: "#22c55e" },
      { name: "Protein intake", icon: "🥩", color: "#f97316" },
      { name: "No junk food", icon: "🚫", color: "#eab308" },
      { name: "Sleep 8 hours", icon: "💤", color: "#8b5cf6" },
    ],
  },
  mindfulness: {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Inner peace & wellness",
    levelRequired: 20,
    icon: "🧘",
    habits: [
      { name: "Meditate", icon: "🧘", color: "#8b5cf6" },
      { name: "Gratitude journal", icon: "📓", color: "#ec4899" },
      { name: "Deep breathing", icon: "🌬️", color: "#0ea5e9" },
      { name: "Digital detox", icon: "📵", color: "#6366f1" },
      { name: "Nature walk", icon: "🌿", color: "#22c55e" },
    ],
  },
  developer: {
    id: "developer",
    name: "Developer Habits",
    description: "Level up your coding",
    levelRequired: 25,
    icon: "👨‍💻",
    habits: [
      { name: "Code 1 hour", icon: "💻", color: "#6366f1" },
      { name: "Read documentation", icon: "📚", color: "#0ea5e9" },
      { name: "Contribute to OSS", icon: "🐙", color: "#22c55e" },
      { name: "Take breaks", icon: "☕", color: "#f97316" },
      { name: "Learn something new", icon: "🧠", color: "#8b5cf6" },
    ],
  },
};

// Sound effects
export const SOUND_EFFECTS = {
  default: {
    id: "default",
    name: "Default",
    levelRequired: 0,
  },
  chime: {
    id: "chime",
    name: "Chime",
    levelRequired: 10,
  },
  nature: {
    id: "nature",
    name: "Nature",
    levelRequired: 20,
  },
  gaming: {
    id: "gaming",
    name: "Gaming",
    levelRequired: 30,
  },
};
