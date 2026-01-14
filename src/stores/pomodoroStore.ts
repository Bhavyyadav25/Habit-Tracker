import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PomodoroSession, PomodoroSettings } from "@/types";
import { generateId } from "@/lib/utils";
import { DEFAULT_POMODORO_SETTINGS } from "@/lib/constants";
import { invoke } from "@tauri-apps/api/core";

type TimerState = "idle" | "running" | "paused";
type SessionType = "work" | "short_break" | "long_break";

interface PomodoroState {
  // Timer state
  timerState: TimerState;
  currentSessionType: SessionType;
  timeRemaining: number;
  sessionsCompleted: number;
  currentHabitId: string | null;

  // Settings
  settings: PomodoroSettings;

  // History
  sessions: PomodoroSession[];

  // Actions
  startTimer: (habitId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  tick: () => void;
  completeSession: () => Promise<void>;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  fetchSessions: () => Promise<void>;
  getTodaySessions: () => PomodoroSession[];
  getTotalFocusTime: (days: number) => number;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      timerState: "idle",
      currentSessionType: "work",
      timeRemaining: DEFAULT_POMODORO_SETTINGS.workDuration,
      sessionsCompleted: 0,
      currentHabitId: null,
      settings: DEFAULT_POMODORO_SETTINGS,
      sessions: [],

      startTimer: (habitId) => {
        const { settings, currentSessionType } = get();
        let duration: number;

        switch (currentSessionType) {
          case "work":
            duration = settings.workDuration;
            break;
          case "short_break":
            duration = settings.shortBreakDuration;
            break;
          case "long_break":
            duration = settings.longBreakDuration;
            break;
        }

        set({
          timerState: "running",
          timeRemaining: duration,
          currentHabitId: habitId || null,
        });
      },

      pauseTimer: () => {
        set({ timerState: "paused" });
      },

      resumeTimer: () => {
        set({ timerState: "running" });
      },

      resetTimer: () => {
        const { settings, currentSessionType } = get();
        let duration: number;

        switch (currentSessionType) {
          case "work":
            duration = settings.workDuration;
            break;
          case "short_break":
            duration = settings.shortBreakDuration;
            break;
          case "long_break":
            duration = settings.longBreakDuration;
            break;
        }

        set({
          timerState: "idle",
          timeRemaining: duration,
        });
      },

      skipSession: () => {
        const { currentSessionType, sessionsCompleted, settings } = get();

        if (currentSessionType === "work") {
          // Skip to break
          const isLongBreak =
            (sessionsCompleted + 1) % settings.sessionsUntilLongBreak === 0;
          set({
            timerState: "idle",
            currentSessionType: isLongBreak ? "long_break" : "short_break",
            timeRemaining: isLongBreak
              ? settings.longBreakDuration
              : settings.shortBreakDuration,
          });
        } else {
          // Skip to work
          set({
            timerState: "idle",
            currentSessionType: "work",
            timeRemaining: settings.workDuration,
          });
        }
      },

      tick: () => {
        const { timeRemaining, timerState } = get();

        if (timerState !== "running") return;

        if (timeRemaining <= 1) {
          get().completeSession();
        } else {
          set({ timeRemaining: timeRemaining - 1 });
        }
      },

      completeSession: async () => {
        const { currentSessionType, sessionsCompleted, settings, currentHabitId } = get();

        const session: PomodoroSession = {
          id: generateId(),
          habitId: currentHabitId || undefined,
          duration:
            currentSessionType === "work"
              ? settings.workDuration
              : currentSessionType === "short_break"
              ? settings.shortBreakDuration
              : settings.longBreakDuration,
          type: currentSessionType,
          completed: true,
          startedAt: new Date(
            Date.now() -
              (currentSessionType === "work"
                ? settings.workDuration
                : currentSessionType === "short_break"
                ? settings.shortBreakDuration
                : settings.longBreakDuration) *
                1000
          ).toISOString(),
          endedAt: new Date().toISOString(),
        };

        try {
          await invoke("add_pomodoro_session", { session });
        } catch {
          // Continue with local state
        }

        if (currentSessionType === "work") {
          const newSessionsCompleted = sessionsCompleted + 1;
          const isLongBreak =
            newSessionsCompleted % settings.sessionsUntilLongBreak === 0;

          set((state) => ({
            sessions: [...state.sessions, session],
            sessionsCompleted: newSessionsCompleted,
            timerState: settings.autoStartBreaks ? "running" : "idle",
            currentSessionType: isLongBreak ? "long_break" : "short_break",
            timeRemaining: isLongBreak
              ? settings.longBreakDuration
              : settings.shortBreakDuration,
          }));
        } else {
          set((state) => ({
            sessions: [...state.sessions, session],
            timerState: settings.autoStartWork ? "running" : "idle",
            currentSessionType: "work",
            timeRemaining: settings.workDuration,
          }));
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      fetchSessions: async () => {
        try {
          const sessions = await invoke<PomodoroSession[]>("get_pomodoro_sessions");
          set({ sessions });
        } catch {
          // Keep local state
        }
      },

      getTodaySessions: () => {
        const { sessions } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return sessions.filter((s) => new Date(s.startedAt) >= today);
      },

      getTotalFocusTime: (days) => {
        const { sessions } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return sessions
          .filter(
            (s) =>
              s.type === "work" &&
              s.completed &&
              new Date(s.startedAt) >= cutoff
          )
          .reduce((acc, s) => acc + s.duration, 0);
      },
    }),
    {
      name: "habitflow-pomodoro",
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);
