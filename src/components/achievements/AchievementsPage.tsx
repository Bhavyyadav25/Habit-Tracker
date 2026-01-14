import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Lock, Sparkles, Award, Zap, Gift } from "lucide-react";
import { useAchievementStore } from "@/stores/achievementStore";
import { useHabitStore } from "@/stores/habitStore";
import { useMoodStore } from "@/stores/moodStore";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { ACHIEVEMENTS } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LevelUnlocks } from "./LevelUnlocks";
import { cn } from "@/lib/utils";
import type { AchievementType, AchievementDefinition } from "@/types";

// Achievement tiers based on XP reward
function getAchievementTier(xpReward: number): "bronze" | "silver" | "gold" | "diamond" {
  if (xpReward >= 500) return "diamond";
  if (xpReward >= 200) return "gold";
  if (xpReward >= 50) return "silver";
  return "bronze";
}

const tierColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-slate-300 to-slate-500",
  gold: "from-yellow-400 to-yellow-600",
  diamond: "from-cyan-300 to-blue-500",
};

const tierBgColors = {
  bronze: "bg-amber-100 dark:bg-amber-900/30",
  silver: "bg-slate-100 dark:bg-slate-800/50",
  gold: "bg-yellow-100 dark:bg-yellow-900/30",
  diamond: "bg-cyan-100 dark:bg-cyan-900/30",
};

interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

export function AchievementsPage() {
  const {
    achievements,
    totalXp,
    pendingAchievements,
    getUserStats,
    isUnlocked,
    dismissPendingAchievement,
  } = useAchievementStore();
  const { habits, completions, getAllHabitsWithStats } = useHabitStore();
  const { entries: moodEntries } = useMoodStore();
  const { sessions } = usePomodoroStore();

  const [celebratingAchievement, setCelebratingAchievement] = useState<AchievementDefinition | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [activeTab, setActiveTab] = useState<"achievements" | "rewards">("achievements");

  const userStats = getUserStats();
  const habitsWithStats = getAllHabitsWithStats();

  // Show celebration for pending achievements
  useEffect(() => {
    if (pendingAchievements.length > 0) {
      const achievementType = pendingAchievements[0];
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementType);
      if (achievement) {
        setCelebratingAchievement(achievement);
      }
    }
  }, [pendingAchievements]);

  // Calculate progress for each achievement
  const achievementProgress = useMemo((): Record<AchievementType, AchievementProgress> => {
    const bestStreak = Math.max(...habitsWithStats.map((h) => h.currentStreak), 0);
    const habitCount = habits.filter((h) => !h.archived).length;
    const pomodoroCount = sessions.filter((s) => s.type === "work" && s.completed).length;

    // Calculate mood streak
    let moodStreak = 0;
    const sortedMoods = [...moodEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (sortedMoods.length > 0) {
      const today = new Date().toDateString();
      const latest = new Date(sortedMoods[0].createdAt).toDateString();
      if (latest === today || latest === new Date(Date.now() - 86400000).toDateString()) {
        moodStreak = 1;
        for (let i = 1; i < sortedMoods.length; i++) {
          const prev = new Date(sortedMoods[i - 1].createdAt).toDateString();
          const curr = new Date(sortedMoods[i].createdAt).toDateString();
          const prevDate = new Date(prev);
          const currDate = new Date(curr);
          const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
          if (diff === 1) {
            moodStreak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      streak_7: { current: bestStreak, target: 7, percentage: Math.min((bestStreak / 7) * 100, 100) },
      streak_30: { current: bestStreak, target: 30, percentage: Math.min((bestStreak / 30) * 100, 100) },
      streak_100: { current: bestStreak, target: 100, percentage: Math.min((bestStreak / 100) * 100, 100) },
      streak_365: { current: bestStreak, target: 365, percentage: Math.min((bestStreak / 365) * 100, 100) },
      first_habit: { current: habitCount, target: 1, percentage: habitCount >= 1 ? 100 : 0 },
      habits_5: { current: habitCount, target: 5, percentage: Math.min((habitCount / 5) * 100, 100) },
      habits_10: { current: habitCount, target: 10, percentage: Math.min((habitCount / 10) * 100, 100) },
      perfect_week: { current: 0, target: 7, percentage: 0 }, // Would need more complex calculation
      perfect_month: { current: 0, target: 30, percentage: 0 },
      mood_streak_7: { current: moodStreak, target: 7, percentage: Math.min((moodStreak / 7) * 100, 100) },
      pomodoro_10: { current: pomodoroCount, target: 10, percentage: Math.min((pomodoroCount / 10) * 100, 100) },
      pomodoro_50: { current: pomodoroCount, target: 50, percentage: Math.min((pomodoroCount / 50) * 100, 100) },
      pomodoro_100: { current: pomodoroCount, target: 100, percentage: Math.min((pomodoroCount / 100) * 100, 100) },
      early_bird: { current: 0, target: 1, percentage: isUnlocked("early_bird") ? 100 : 0 },
      night_owl: { current: 0, target: 1, percentage: isUnlocked("night_owl") ? 100 : 0 },
      level_5: { current: userStats.level, target: 5, percentage: Math.min((userStats.level / 5) * 100, 100) },
      level_10: { current: userStats.level, target: 10, percentage: Math.min((userStats.level / 10) * 100, 100) },
      level_25: { current: userStats.level, target: 25, percentage: Math.min((userStats.level / 25) * 100, 100) },
      level_50: { current: userStats.level, target: 50, percentage: Math.min((userStats.level / 50) * 100, 100) },
    };
  }, [habitsWithStats, habits, sessions, moodEntries, userStats.level, isUnlocked]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((achievement) => {
      const unlocked = isUnlocked(achievement.id);
      if (filter === "unlocked") return unlocked;
      if (filter === "locked") return !unlocked;
      return true;
    });
  }, [filter, isUnlocked]);

  // Group achievements by category
  const achievementCategories = useMemo(() => {
    return {
      streaks: filteredAchievements.filter((a) => a.id.startsWith("streak")),
      habits: filteredAchievements.filter((a) => a.id.startsWith("habit") || a.id === "first_habit"),
      consistency: filteredAchievements.filter((a) => a.id.startsWith("perfect")),
      mood: filteredAchievements.filter((a) => a.id.startsWith("mood")),
      pomodoro: filteredAchievements.filter((a) => a.id.startsWith("pomodoro")),
      time: filteredAchievements.filter((a) => ["early_bird", "night_owl"].includes(a.id)),
      levels: filteredAchievements.filter((a) => a.id.startsWith("level")),
    };
  }, [filteredAchievements]);

  // Recently unlocked (last 3)
  const recentlyUnlocked = useMemo(() => {
    return [...achievements]
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 3)
      .map((a) => ACHIEVEMENTS.find((def) => def.id === a.type)!)
      .filter(Boolean);
  }, [achievements]);

  const handleDismissCelebration = () => {
    if (celebratingAchievement) {
      dismissPendingAchievement(celebratingAchievement.id);
      setCelebratingAchievement(null);
    }
  };

  const unlockedCount = achievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Level & XP */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Level Card */}
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{userStats.level}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Star size={16} className="text-yellow-800" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Level {userStats.level}</h2>
                <p className="text-[var(--text-muted)] mb-3">{totalXp.toLocaleString()} Total XP</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Progress to Level {userStats.level + 1}</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {userStats.currentXp} / {userStats.xpToNextLevel} XP
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(userStats.currentXp / userStats.xpToNextLevel) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Progress Card */}
        <Card className="lg:w-80">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-[var(--bg-tertiary)]"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 226" }}
                    animate={{ strokeDasharray: `${(completionPercentage / 100) * 226} 226` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {unlockedCount} / {totalCount}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Achievements Unlocked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("achievements")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "achievements"
              ? "bg-primary-500 text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <Trophy size={16} />
          Achievements
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "rewards"
              ? "bg-primary-500 text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <Gift size={16} />
          Level Rewards
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "rewards" ? (
        <LevelUnlocks />
      ) : (
        <>
      {/* Recently Unlocked Showcase */}
      {recentlyUnlocked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} />
              Recently Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {recentlyUnlocked.map((achievement) => {
                const tier = getAchievementTier(achievement.xpReward);
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl",
                      tierBgColors[tier]
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg",
                        tierColors[tier]
                      )}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{achievement.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{achievement.description}</p>
                      {achievement.xpReward > 0 && (
                        <p className="text-xs text-primary-500 font-medium mt-1">
                          +{achievement.xpReward} XP
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "unlocked", "locked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-primary-500 text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {f} ({f === "all" ? totalCount : f === "unlocked" ? unlockedCount : totalCount - unlockedCount})
          </button>
        ))}
      </div>

      {/* Achievement Categories */}
      <div className="space-y-6">
        {Object.entries(achievementCategories).map(([category, categoryAchievements]) => {
          if (categoryAchievements.length === 0) return null;

          const categoryLabels: Record<string, { title: string; icon: React.ReactNode }> = {
            streaks: { title: "Streak Achievements", icon: <Zap className="text-orange-500" /> },
            habits: { title: "Habit Achievements", icon: <Award className="text-blue-500" /> },
            consistency: { title: "Consistency Achievements", icon: <Star className="text-yellow-500" /> },
            mood: { title: "Mood Achievements", icon: <span className="text-xl">🧠</span> },
            pomodoro: { title: "Pomodoro Achievements", icon: <span className="text-xl">🍅</span> },
            time: { title: "Time Achievements", icon: <span className="text-xl">⏰</span> },
            levels: { title: "Level Achievements", icon: <Sparkles className="text-purple-500" /> },
          };

          const { title, icon } = categoryLabels[category] || { title: category, icon: null };

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {icon}
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map((achievement) => {
                    const unlocked = isUnlocked(achievement.id);
                    const tier = getAchievementTier(achievement.xpReward);
                    const progress = achievementProgress[achievement.id];

                    return (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "relative p-4 rounded-xl border transition-all",
                          unlocked
                            ? "bg-[var(--bg-secondary)] border-[var(--border)]"
                            : "bg-[var(--bg-primary)] border-dashed border-[var(--border)] opacity-70"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                              unlocked
                                ? `bg-gradient-to-br ${tierColors[tier]} shadow-lg`
                                : "bg-[var(--bg-tertiary)]"
                            )}
                          >
                            {unlocked ? achievement.icon : <Lock size={20} className="text-[var(--text-muted)]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-semibold truncate",
                              unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                            )}>
                              {achievement.name}
                            </p>
                            <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                              {achievement.description}
                            </p>
                            {achievement.xpReward > 0 && (
                              <p className={cn(
                                "text-xs font-medium mt-1",
                                unlocked ? "text-green-500" : "text-[var(--text-muted)]"
                              )}>
                                {unlocked ? "+" : ""}{achievement.xpReward} XP
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress bar for locked achievements */}
                        {!unlocked && progress && progress.target > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                              <span>Progress</span>
                              <span>{progress.current} / {progress.target}</span>
                            </div>
                            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Unlocked badge */}
                        {unlocked && (
                          <div className="absolute top-2 right-2">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center",
                              tierBgColors[tier]
                            )}>
                              <span className="text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
        </>
      )}

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {celebratingAchievement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleDismissCelebration}
            />

            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#eab308", "#22c55e"][
                      Math.floor(Math.random() * 5)
                    ],
                    borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  }}
                  initial={{ top: "-5%", rotate: 0, opacity: 1 }}
                  animate={{
                    top: "105%",
                    rotate: Math.random() * 720 - 360,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="relative bg-[var(--bg-primary)] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={cn(
                  "w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl bg-gradient-to-br shadow-xl",
                  tierColors[getAchievementTier(celebratingAchievement.xpReward)]
                )}
              >
                {celebratingAchievement.icon}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-sm font-medium text-primary-500 mb-2">Achievement Unlocked!</h2>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {celebratingAchievement.name}
                </h3>
                <p className="text-[var(--text-muted)] mb-4">
                  {celebratingAchievement.description}
                </p>

                {celebratingAchievement.xpReward > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30"
                  >
                    <Zap size={18} className="text-primary-500" />
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      +{celebratingAchievement.xpReward} XP
                    </span>
                  </motion.div>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={handleDismissCelebration}
                className="mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
