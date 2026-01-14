import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useHabitStore } from "@/stores/habitStore";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SearchModal } from "./SearchModal";
import { NotificationsPanel } from "./NotificationsPanel";

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  habits: "My Habits",
  mood: "Mood Tracking",
  pomodoro: "Pomodoro Timer",
  stats: "Statistics",
  achievements: "Achievements",
  ai: "AI Coach",
  settings: "Settings",
};

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { currentPage, settings, setTheme, getEffectiveTheme } = useSettingsStore();
  const { getTodayProgress, getAllHabitsWithStats } = useHabitStore();
  const progress = getTodayProgress();
  const effectiveTheme = getEffectiveTheme();

  const habits = getAllHabitsWithStats();
  const pendingCount = habits.filter(h => !h.completedToday).length;
  const streakCount = habits.filter(h => h.currentStreak >= 3).length;
  const hasNotifications = pendingCount > 0 || streakCount > 0;

  const toggleTheme = () => {
    setTheme(effectiveTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)]">
      {/* Page title */}
      <div className="flex items-center gap-4">
        <motion.h1
          key={currentPage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-[var(--text-primary)]"
        >
          {pageLabels[currentPage] || "HabitFlow"}
        </motion.h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Today's progress mini ring */}
        <div className="flex items-center gap-2">
          <ProgressRing
            progress={progress.percentage}
            size={36}
            strokeWidth={3}
            showPercentage={false}
          />
          <div className="text-sm">
            <span className="font-medium text-[var(--text-primary)]">
              {progress.completed}/{progress.total}
            </span>
            <span className="text-[var(--text-muted)] ml-1">today</span>
          </div>
        </div>

        {/* Search button */}
        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
          <Search size={18} />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={18} />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
          <NotificationsPanel
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <motion.div
            initial={false}
            animate={{ rotate: effectiveTheme === "dark" ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {effectiveTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </motion.div>
        </Button>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
