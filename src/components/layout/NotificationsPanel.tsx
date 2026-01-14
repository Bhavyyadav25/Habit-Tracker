import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Flame, Trophy, X } from "lucide-react";
import { useHabitStore } from "@/stores/habitStore";
import { useAchievementStore } from "@/stores/achievementStore";
import { ACHIEVEMENTS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: "habit" | "achievement" | "streak" | "reminder";
  title: string;
  message: string;
  icon: React.ReactNode;
  time: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { getAllHabitsWithStats } = useHabitStore();
  const { getUnlockedAchievements } = useAchievementStore();

  const habits = getAllHabitsWithStats();
  const achievements = getUnlockedAchievements();

  // Generate notifications from data
  const notifications: Notification[] = [];

  // Add streak notifications for habits with streaks >= 3
  habits.forEach((habit) => {
    if (habit.currentStreak >= 3) {
      notifications.push({
        id: `streak-${habit.id}`,
        type: "streak",
        title: "Streak Alert!",
        message: `${habit.name} has a ${habit.currentStreak}-day streak!`,
        icon: <Flame className="text-orange-500" size={18} />,
        time: new Date(),
        read: false,
      });
    }
  });

  // Add recent achievements
  achievements.slice(0, 3).forEach((achievement) => {
    const def = ACHIEVEMENTS.find((a) => a.id === achievement.type);
    if (def) {
      notifications.push({
        id: `achievement-${achievement.id}`,
        type: "achievement",
        title: "Achievement Unlocked!",
        message: `${def.icon} ${def.name}`,
        icon: <Trophy className="text-yellow-500" size={18} />,
        time: new Date(achievement.unlockedAt),
        read: false,
      });
    }
  });

  // Add pending habits reminder
  const pendingHabits = habits.filter((h) => !h.completedToday);
  if (pendingHabits.length > 0) {
    notifications.push({
      id: "pending-habits",
      type: "reminder",
      title: "Habits Reminder",
      message: `You have ${pendingHabits.length} habit${pendingHabits.length > 1 ? "s" : ""} pending today`,
      icon: <Bell className="text-blue-500" size={18} />,
      time: new Date(),
      read: false,
    });
  }

  // Sort by time
  notifications.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-2 text-[var(--text-muted)]" size={32} />
                  <p className="text-[var(--text-muted)]">No notifications</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                    >
                      <div className="mt-0.5">{notification.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--text-primary)]">
                          {notification.title}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] truncate">
                          {notification.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-[var(--border)]">
                <button className="w-full py-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
