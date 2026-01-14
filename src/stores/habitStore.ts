import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, HabitCompletion, HabitWithStats } from "@/types";
import { generateId, isToday, getStartOfDay } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, notes?: string) => Promise<HabitCompletion>;
  uncompleteHabit: (habitId: string) => Promise<void>;
  getHabitWithStats: (habitId: string) => HabitWithStats | null;
  getAllHabitsWithStats: () => HabitWithStats[];
  getTodayProgress: () => { completed: number; total: number; percentage: number };
}

// Calculate streak for a habit
function calculateStreak(
  habitId: string,
  completions: HabitCompletion[],
  frequency: string
): { current: number; longest: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (habitCompletions.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  const today = getStartOfDay();

  // Check if completed today or yesterday to start counting
  const mostRecent = new Date(habitCompletions[0].completedAt);
  const mostRecentDay = getStartOfDay(mostRecent);
  const diffDays = Math.floor((today.getTime() - mostRecentDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // Streak broken
    currentStreak = 0;
  } else {
    currentStreak = 1;
    // Count backwards
    for (let i = 1; i < habitCompletions.length; i++) {
      const prevDate = getStartOfDay(new Date(habitCompletions[i - 1].completedAt));
      const currDate = getStartOfDay(new Date(habitCompletions[i].completedAt));
      const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        currentStreak++;
        tempStreak++;
      } else if (dayDiff > 1) {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = getStartOfDay(new Date(habitCompletions[i - 1].completedAt));
    const currDate = getStartOfDay(new Date(habitCompletions[i].completedAt));
    const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],
      loading: false,
      error: null,

      fetchHabits: async () => {
        set({ loading: true, error: null });
        try {
          const habits = await invoke<Habit[]>("get_habits");
          const completions = await invoke<HabitCompletion[]>("get_completions");
          set({ habits, completions, loading: false });
        } catch (error) {
          // Fallback to local state if Tauri is not available
          set({ loading: false });
        }
      },

      addHabit: async (habitData) => {
        const habit: Habit = {
          ...habitData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          archived: false,
        };

        try {
          await invoke("add_habit", { habit });
        } catch {
          // Continue with local state
        }

        set((state) => ({ habits: [...state.habits, habit] }));
        return habit;
      },

      updateHabit: async (id, updates) => {
        try {
          await invoke("update_habit", { id, updates });
        } catch {
          // Continue with local state
        }

        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      deleteHabit: async (id) => {
        try {
          await invoke("delete_habit", { id });
        } catch {
          // Continue with local state
        }

        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          completions: state.completions.filter((c) => c.habitId !== id),
        }));
      },

      archiveHabit: async (id) => {
        await get().updateHabit(id, { archived: true });
      },

      completeHabit: async (habitId, notes) => {
        const completion: HabitCompletion = {
          id: generateId(),
          habitId,
          completedAt: new Date().toISOString(),
          count: 1,
          notes,
        };

        try {
          await invoke("add_completion", { completion });
        } catch {
          // Continue with local state
        }

        set((state) => ({
          completions: [...state.completions, completion],
        }));

        return completion;
      },

      uncompleteHabit: async (habitId) => {
        const todayCompletions = get().completions.filter(
          (c) => c.habitId === habitId && isToday(c.completedAt)
        );

        if (todayCompletions.length > 0) {
          const lastCompletion = todayCompletions[todayCompletions.length - 1];
          try {
            await invoke("delete_completion", { id: lastCompletion.id });
          } catch {
            // Continue with local state
          }

          set((state) => ({
            completions: state.completions.filter((c) => c.id !== lastCompletion.id),
          }));
        }
      },

      getHabitWithStats: (habitId) => {
        const { habits, completions } = get();
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return null;

        const streaks = calculateStreak(habitId, completions, habit.frequency);
        const todayCompletions = completions.filter(
          (c) => c.habitId === habitId && isToday(c.completedAt)
        );
        const totalCompletions = completions.filter((c) => c.habitId === habitId).length;

        return {
          ...habit,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
          completedToday: todayCompletions.length >= habit.targetCount,
          todayCount: todayCompletions.reduce((sum, c) => sum + c.count, 0),
          totalCompletions,
        };
      },

      getAllHabitsWithStats: () => {
        const { habits } = get();
        return habits
          .filter((h) => !h.archived)
          .map((h) => get().getHabitWithStats(h.id)!)
          .filter(Boolean);
      },

      getTodayProgress: () => {
        const habitsWithStats = get().getAllHabitsWithStats();
        const total = habitsWithStats.length;
        const completed = habitsWithStats.filter((h) => h.completedToday).length;
        return {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      },
    }),
    {
      name: "habitflow-habits",
      partialize: (state) => ({
        habits: state.habits,
        completions: state.completions,
      }),
    }
  )
);
