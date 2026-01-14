import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/stats/Dashboard";
import { StatisticsPage } from "@/components/stats/StatisticsPage";
import { AchievementsPage } from "@/components/achievements/AchievementsPage";
import { HabitList } from "@/components/habits/HabitList";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { useSettingsStore } from "@/stores/settingsStore";
import { useHabitStore } from "@/stores/habitStore";
import { useMoodStore } from "@/stores/moodStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useAchievementStore } from "@/stores/achievementStore";
import { fadeIn } from "@/lib/animations";

function PageContent() {
  const { currentPage } = useSettingsStore();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    habits: <HabitList />,
    mood: (
      <div className="max-w-md mx-auto">
        <MoodPicker />
      </div>
    ),
    pomodoro: <PomodoroTimer />,
    stats: <StatisticsPage />,
    achievements: <AchievementsPage />,
    ai: (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">AI Coach coming soon...</p>
      </div>
    ),
    settings: <SettingsPage />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-6 overflow-y-auto h-[calc(100vh-4rem)]"
      >
        {pages[currentPage] || pages.dashboard}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const { getEffectiveTheme, settings } = useSettingsStore();
  const fetchHabits = useHabitStore((state) => state.fetchHabits);
  const fetchMoodEntries = useMoodStore((state) => state.fetchMoodEntries);
  const fetchSessions = usePomodoroStore((state) => state.fetchSessions);
  const fetchAchievements = useAchievementStore((state) => state.fetchAchievements);

  // Apply theme on mount and when it changes
  useEffect(() => {
    const theme = getEffectiveTheme();
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme, getEffectiveTheme]);

  // Fetch initial data
  useEffect(() => {
    fetchHabits();
    fetchMoodEntries();
    fetchSessions();
    fetchAchievements();
  }, [fetchHabits, fetchMoodEntries, fetchSessions, fetchAchievements]);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <PageContent />
        </main>
      </div>
    </div>
  );
}

export default App;
