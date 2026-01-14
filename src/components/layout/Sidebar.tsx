import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle2,
  Smile,
  Timer,
  BarChart3,
  Trophy,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAchievementStore } from "@/stores/achievementStore";
import type { Page } from "@/types";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "habits", label: "Habits", icon: <CheckCircle2 size={20} /> },
  { id: "mood", label: "Mood", icon: <Smile size={20} /> },
  { id: "pomodoro", label: "Pomodoro", icon: <Timer size={20} /> },
  { id: "stats", label: "Statistics", icon: <BarChart3 size={20} /> },
  { id: "achievements", label: "Achievements", icon: <Trophy size={20} /> },
  { id: "ai", label: "AI Coach", icon: <Bot size={20} /> },
  { id: "settings", label: "Settings", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar } =
    useSettingsStore();
  const { getUserStats } = useAchievementStore();
  const stats = getUserStats();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
        <motion.div
          initial={false}
          animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <Sparkles className="text-primary-500 shrink-0" size={24} />
          {!sidebarCollapsed && (
            <span className="font-bold text-lg text-[var(--text-primary)] whitespace-nowrap">
              HabitFlow
            </span>
          )}
        </motion.div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} className="text-[var(--text-secondary)]" />
          ) : (
            <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
              currentPage === item.id
                ? "bg-primary-500 text-white shadow-md"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            {!sidebarCollapsed && (
              <motion.span
                initial={false}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap text-sm font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Level indicator */}
      <div className="p-4 border-t border-[var(--border)]">
        <div
          className={cn(
            "flex items-center gap-3",
            sidebarCollapsed && "justify-center"
          )}
        >
          <div className="relative">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold level-badge"
              whileHover={{ scale: 1.1 }}
            >
              {stats.level}
            </motion.div>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text-secondary)]">Level {stats.level}</p>
              <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full mt-1 overflow-hidden">
                <motion.div
                  className="h-full xp-bar rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(stats.currentXp / stats.xpToNextLevel) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {stats.currentXp} / {stats.xpToNextLevel} XP
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
