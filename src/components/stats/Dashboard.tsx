import { motion } from "framer-motion";
import {
  Flame,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  Award,
} from "lucide-react";
import { useHabitStore } from "@/stores/habitStore";
import { useMoodStore } from "@/stores/moodStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useAchievementStore } from "@/stores/achievementStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { HabitList } from "@/components/habits/HabitList";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatDuration, getStreakEmoji, getMoodColor } from "@/lib/utils";
import { MOOD_EMOJIS } from "@/lib/constants";

export function Dashboard() {
  const { getTodayProgress, getAllHabitsWithStats } = useHabitStore();
  const { getTodayMood, getAverageMood, getMoodStreak } = useMoodStore();
  const { getTodaySessions, getTotalFocusTime } = usePomodoroStore();
  const { getUserStats, getUnlockedAchievements } = useAchievementStore();

  const progress = getTodayProgress();
  const habits = getAllHabitsWithStats();
  const todayMood = getTodayMood();
  const avgMood = getAverageMood(7);
  const moodStreak = getMoodStreak();
  const userStats = getUserStats();
  const todaySessions = getTodaySessions().filter(
    (s) => s.type === "work" && s.completed
  );
  const focusTimeToday = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const longestStreak = Math.max(...habits.map((h) => h.currentStreak), 0);
  const recentAchievements = getUnlockedAchievements()
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Progress */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Today's Progress</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {progress.completed}/{progress.total}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">habits completed</p>
                </div>
                <ProgressRing
                  progress={progress.percentage}
                  size={70}
                  strokeWidth={6}
                  color="var(--accent)"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Longest Streak */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Best Streak</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {longestStreak} {getStreakEmoji(longestStreak)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">days in a row</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Focus Time */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Focus Time</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {formatDuration(Math.floor(focusTimeToday / 60))}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {todaySessions.length} sessions today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level */}
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-muted)]">Level {userStats.level}</p>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full xp-bar rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(userStats.currentXp / userStats.xpToNextLevel) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {userStats.currentXp} / {userStats.xpToNextLevel} XP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Habits */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <HabitList />
        </motion.div>

        {/* Right column - Mood and quick stats */}
        <motion.div variants={staggerItem} className="space-y-4">
          <MoodPicker />

          {/* Mood summary */}
          {todayMood && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mood Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl mb-1">{todayMood.emoji}</p>
                    <p className="text-xs text-[var(--text-muted)]">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {avgMood.toFixed(1)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">7-day avg</p>
                  </div>
                </div>
                {moodStreak > 1 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {moodStreak} day mood streak 🎯
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent achievements */}
          {recentAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-lg">
                        {
                          {
                            streak_7: "🔥",
                            streak_30: "⚡",
                            streak_100: "💎",
                            streak_365: "👑",
                            first_habit: "🌱",
                            habits_5: "🏗️",
                            habits_10: "🎯",
                            perfect_week: "🌟",
                            perfect_month: "🏆",
                            mood_streak_7: "🧠",
                            pomodoro_10: "🍅",
                            pomodoro_50: "⏱️",
                            pomodoro_100: "🎖️",
                            early_bird: "🌅",
                            night_owl: "🦉",
                            level_5: "⭐",
                            level_10: "🌟",
                            level_25: "💫",
                            level_50: "✨",
                          }[achievement.type]
                        }
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {achievement.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
