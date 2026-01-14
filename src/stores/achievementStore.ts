import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, AchievementType, UserStats } from "@/types";
import { generateId, calculateLevelFromXp } from "@/lib/utils";
import { ACHIEVEMENTS, XP_REWARDS } from "@/lib/constants";
import { invoke } from "@tauri-apps/api/core";

interface AchievementState {
  achievements: Achievement[];
  totalXp: number;
  pendingAchievements: AchievementType[];

  // Computed
  getUserStats: () => UserStats;
  isUnlocked: (type: AchievementType) => boolean;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => AchievementType[];

  // Actions
  unlockAchievement: (type: AchievementType) => Promise<void>;
  addXp: (amount: number, reason?: string) => void;
  checkAchievements: (context: AchievementContext) => Promise<void>;
  dismissPendingAchievement: (type: AchievementType) => void;
  fetchAchievements: () => Promise<void>;
}

interface AchievementContext {
  habitStreak?: number;
  habitCount?: number;
  moodStreak?: number;
  pomodoroCount?: number;
  level?: number;
  hour?: number;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: [],
      totalXp: 0,
      pendingAchievements: [],

      getUserStats: () => {
        const { totalXp } = get();
        return {
          ...calculateLevelFromXp(totalXp),
          totalXp,
        };
      },

      isUnlocked: (type) => {
        return get().achievements.some((a) => a.type === type);
      },

      getUnlockedAchievements: () => {
        return get().achievements;
      },

      getLockedAchievements: () => {
        const { achievements } = get();
        const unlockedTypes = new Set(achievements.map((a) => a.type));
        return ACHIEVEMENTS.map((a) => a.id).filter(
          (id) => !unlockedTypes.has(id)
        );
      },

      unlockAchievement: async (type) => {
        const { isUnlocked, addXp } = get();

        if (isUnlocked(type)) return;

        const achievement: Achievement = {
          id: generateId(),
          type,
          unlockedAt: new Date().toISOString(),
        };

        const definition = ACHIEVEMENTS.find((a) => a.id === type);
        if (definition && definition.xpReward > 0) {
          addXp(definition.xpReward, `Achievement: ${definition.name}`);
        }

        try {
          await invoke("add_achievement", { achievement });
        } catch {
          // Continue with local state
        }

        set((state) => ({
          achievements: [...state.achievements, achievement],
          pendingAchievements: [...state.pendingAchievements, type],
        }));
      },

      addXp: (amount, _reason) => {
        set((state) => ({
          totalXp: state.totalXp + amount,
        }));

        // Check level achievements
        const { getUserStats, checkAchievements } = get();
        const stats = getUserStats();
        checkAchievements({ level: stats.level });
      },

      checkAchievements: async (context) => {
        const { isUnlocked, unlockAchievement } = get();

        // Streak achievements
        if (context.habitStreak) {
          if (context.habitStreak >= 7 && !isUnlocked("streak_7")) {
            await unlockAchievement("streak_7");
          }
          if (context.habitStreak >= 30 && !isUnlocked("streak_30")) {
            await unlockAchievement("streak_30");
          }
          if (context.habitStreak >= 100 && !isUnlocked("streak_100")) {
            await unlockAchievement("streak_100");
          }
          if (context.habitStreak >= 365 && !isUnlocked("streak_365")) {
            await unlockAchievement("streak_365");
          }
        }

        // Habit count achievements
        if (context.habitCount) {
          if (context.habitCount >= 1 && !isUnlocked("first_habit")) {
            await unlockAchievement("first_habit");
          }
          if (context.habitCount >= 5 && !isUnlocked("habits_5")) {
            await unlockAchievement("habits_5");
          }
          if (context.habitCount >= 10 && !isUnlocked("habits_10")) {
            await unlockAchievement("habits_10");
          }
        }

        // Mood streak
        if (context.moodStreak) {
          if (context.moodStreak >= 7 && !isUnlocked("mood_streak_7")) {
            await unlockAchievement("mood_streak_7");
          }
        }

        // Pomodoro achievements
        if (context.pomodoroCount) {
          if (context.pomodoroCount >= 10 && !isUnlocked("pomodoro_10")) {
            await unlockAchievement("pomodoro_10");
          }
          if (context.pomodoroCount >= 50 && !isUnlocked("pomodoro_50")) {
            await unlockAchievement("pomodoro_50");
          }
          if (context.pomodoroCount >= 100 && !isUnlocked("pomodoro_100")) {
            await unlockAchievement("pomodoro_100");
          }
        }

        // Level achievements
        if (context.level) {
          if (context.level >= 5 && !isUnlocked("level_5")) {
            await unlockAchievement("level_5");
          }
          if (context.level >= 10 && !isUnlocked("level_10")) {
            await unlockAchievement("level_10");
          }
          if (context.level >= 25 && !isUnlocked("level_25")) {
            await unlockAchievement("level_25");
          }
          if (context.level >= 50 && !isUnlocked("level_50")) {
            await unlockAchievement("level_50");
          }
        }

        // Time-based achievements
        if (context.hour !== undefined) {
          if (context.hour < 6 && !isUnlocked("early_bird")) {
            await unlockAchievement("early_bird");
          }
          if (context.hour >= 0 && context.hour < 4 && !isUnlocked("night_owl")) {
            await unlockAchievement("night_owl");
          }
        }
      },

      dismissPendingAchievement: (type) => {
        set((state) => ({
          pendingAchievements: state.pendingAchievements.filter((t) => t !== type),
        }));
      },

      fetchAchievements: async () => {
        try {
          const achievements = await invoke<Achievement[]>("get_achievements");
          set({ achievements });
        } catch {
          // Keep local state
        }
      },
    }),
    {
      name: "habitflow-achievements",
      partialize: (state) => ({
        achievements: state.achievements,
        totalXp: state.totalXp,
      }),
    }
  )
);

// Export XP rewards for use in other stores
export { XP_REWARDS };
