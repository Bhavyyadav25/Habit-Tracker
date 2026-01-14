import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MoodEntry } from "@/types";
import { generateId, isToday, getStartOfDay } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";

interface MoodState {
  entries: MoodEntry[];
  loading: boolean;

  // Actions
  fetchMoodEntries: () => Promise<void>;
  addMoodEntry: (entry: Omit<MoodEntry, "id" | "createdAt">) => Promise<MoodEntry>;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => Promise<void>;
  deleteMoodEntry: (id: string) => Promise<void>;
  getTodayMood: () => MoodEntry | null;
  getMoodStreak: () => number;
  getAverageMood: (days: number) => number;
  getMoodHistory: (days: number) => MoodEntry[];
  getMoodByTag: (tag: string) => MoodEntry[];
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      loading: false,

      fetchMoodEntries: async () => {
        set({ loading: true });
        try {
          const entries = await invoke<MoodEntry[]>("get_mood_entries");
          set({ entries, loading: false });
        } catch {
          set({ loading: false });
        }
      },

      addMoodEntry: async (entryData) => {
        const entry: MoodEntry = {
          ...entryData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        try {
          await invoke("add_mood_entry", { entry });
        } catch {
          // Continue with local state
        }

        set((state) => ({ entries: [...state.entries, entry] }));
        return entry;
      },

      updateMoodEntry: async (id, updates) => {
        try {
          await invoke("update_mood_entry", { id, updates });
        } catch {
          // Continue with local state
        }

        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      deleteMoodEntry: async (id) => {
        try {
          await invoke("delete_mood_entry", { id });
        } catch {
          // Continue with local state
        }

        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      getTodayMood: () => {
        const { entries } = get();
        return entries.find((e) => isToday(e.createdAt)) || null;
      },

      getMoodStreak: () => {
        const { entries } = get();
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (sortedEntries.length === 0) return 0;

        let streak = 0;
        const today = getStartOfDay();
        const mostRecent = getStartOfDay(new Date(sortedEntries[0].createdAt));
        const diffDays = Math.floor(
          (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 1) return 0;

        streak = 1;
        for (let i = 1; i < sortedEntries.length; i++) {
          const prevDate = getStartOfDay(new Date(sortedEntries[i - 1].createdAt));
          const currDate = getStartOfDay(new Date(sortedEntries[i].createdAt));
          const dayDiff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff === 1) {
            streak++;
          } else if (dayDiff > 1) {
            break;
          }
        }

        return streak;
      },

      getAverageMood: (days) => {
        const { entries } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const recentEntries = entries.filter(
          (e) => new Date(e.createdAt) >= cutoff
        );

        if (recentEntries.length === 0) return 0;

        const sum = recentEntries.reduce((acc, e) => acc + e.moodLevel, 0);
        return Math.round((sum / recentEntries.length) * 10) / 10;
      },

      getMoodHistory: (days) => {
        const { entries } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return entries
          .filter((e) => new Date(e.createdAt) >= cutoff)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getMoodByTag: (tag) => {
        const { entries } = get();
        return entries.filter((e) => e.tags.includes(tag));
      },
    }),
    {
      name: "habitflow-mood",
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
