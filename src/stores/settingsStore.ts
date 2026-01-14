import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, Page, ColorTheme } from "@/types";
import { DEFAULT_POMODORO_SETTINGS } from "@/lib/constants";

interface SettingsState {
  settings: AppSettings;
  currentPage: Page;
  sidebarCollapsed: boolean;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setCurrentPage: (page: Page) => void;
  toggleSidebar: () => void;
  getEffectiveTheme: () => "light" | "dark";
}

const defaultSettings: AppSettings = {
  theme: "system",
  colorTheme: "default",
  soundPack: "default",
  soundEnabled: true,
  notifications: {
    enabled: true,
    habitReminders: true,
    breakReminders: true,
    pomodoroAlerts: true,
    dailySummary: true,
    dailySummaryTime: "20:00",
  },
  pomodoro: DEFAULT_POMODORO_SETTINGS,
  ai: {
    provider: "none",
    ollamaModel: "llama2",
    ollamaEndpoint: "http://localhost:11434",
    enableInsights: true,
    enableCoach: true,
  },
  breakReminders: {
    enabled: true,
    intervalMinutes: 30,
    hydrationReminder: true,
    stretchReminder: true,
    eyeRestReminder: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      currentPage: "dashboard",
      sidebarCollapsed: false,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));

        // Apply theme to document
        const effectiveTheme = get().getEffectiveTheme();
        if (effectiveTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      setColorTheme: (colorTheme) => {
        set((state) => ({
          settings: { ...state.settings, colorTheme },
        }));

        // Remove all theme classes and apply the new one
        const themes = ["theme-ocean", "theme-forest", "theme-sunset", "theme-midnight", "theme-aurora", "theme-neon"];
        themes.forEach((t) => document.documentElement.classList.remove(t));
        if (colorTheme !== "default") {
          document.documentElement.classList.add(`theme-${colorTheme}`);
        }
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      getEffectiveTheme: () => {
        const { settings } = get();
        if (settings.theme === "system") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return settings.theme;
      },
    }),
    {
      name: "habitflow-settings",
      partialize: (state) => ({
        settings: state.settings,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Apply theme on load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("habitflow-settings");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      const theme = state?.settings?.theme || "system";
      const colorTheme = state?.settings?.colorTheme || "default";

      // Apply dark mode
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }

      // Apply color theme
      if (colorTheme && colorTheme !== "default") {
        document.documentElement.classList.add(`theme-${colorTheme}`);
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const store = useSettingsStore.getState();
      if (store.settings.theme === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    });
}
