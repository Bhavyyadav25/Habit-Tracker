import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Target,
  Flame,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useHabitStore } from "@/stores/habitStore";
import { useMoodStore } from "@/stores/moodStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, getStreakEmoji } from "@/lib/utils";
import { MOOD_EMOJIS } from "@/lib/constants";

type TimeRange = "week" | "month" | "year" | "custom";

interface DateRange {
  start: Date;
  end: Date;
}

export function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [customRange, setCustomRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  const { habits, completions, getAllHabitsWithStats } = useHabitStore();
  const { entries: moodEntries } = useMoodStore();
  const habitsWithStats = getAllHabitsWithStats();

  // Calculate date range based on selection
  const dateRange = useMemo((): DateRange => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (timeRange) {
      case "week":
        return {
          start: new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000),
          end,
        };
      case "month":
        return {
          start: new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000),
          end,
        };
      case "year":
        return {
          start: new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000),
          end,
        };
      case "custom":
        return customRange;
      default:
        return { start: new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000), end };
    }
  }, [timeRange, customRange]);

  // Filter completions within date range
  const filteredCompletions = useMemo(() => {
    return completions.filter((c) => {
      const date = new Date(c.completedAt);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [completions, dateRange]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalDays = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const activeHabits = habits.filter((h) => !h.archived).length;
    const totalPossible = totalDays * activeHabits;
    const totalCompleted = filteredCompletions.length;
    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    // Best streak across all habits
    const bestStreak = Math.max(...habitsWithStats.map((h) => h.longestStreak), 0);

    // Current active streaks
    const activeStreaks = habitsWithStats.filter((h) => h.currentStreak > 0).length;

    // Perfect days (all habits completed)
    const dayCompletions: Record<string, number> = {};
    filteredCompletions.forEach((c) => {
      const day = new Date(c.completedAt).toDateString();
      dayCompletions[day] = (dayCompletions[day] || 0) + 1;
    });
    const perfectDays = Object.values(dayCompletions).filter(
      (count) => count >= activeHabits
    ).length;

    return {
      totalDays,
      totalCompleted,
      completionRate,
      bestStreak,
      activeStreaks,
      perfectDays,
    };
  }, [dateRange, habits, filteredCompletions, habitsWithStats]);

  // Generate heatmap data (last 365 days for year, or based on range)
  const heatmapData = useMemo(() => {
    const days: { date: Date; count: number; level: number }[] = [];
    const dayMap: Record<string, number> = {};

    filteredCompletions.forEach((c) => {
      const day = new Date(c.completedAt).toDateString();
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(dayMap), 1);
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      const dateStr = current.toDateString();
      const count = dayMap[dateStr] || 0;
      const level = count === 0 ? 0 : Math.ceil((count / maxCount) * 4);

      days.push({
        date: new Date(current),
        count,
        level,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [filteredCompletions, dateRange]);

  // Habit comparison data
  const habitComparison = useMemo(() => {
    return habitsWithStats.map((habit) => {
      const habitCompletions = filteredCompletions.filter(
        (c) => c.habitId === habit.id
      ).length;
      const totalDays = Math.ceil(
        (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const rate = totalDays > 0 ? (habitCompletions / totalDays) * 100 : 0;

      return {
        ...habit,
        completionsInRange: habitCompletions,
        completionRate: rate,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  }, [habitsWithStats, filteredCompletions, dateRange]);

  // Mood correlation data
  const moodCorrelation = useMemo(() => {
    const moodByCompletions: Record<number, { total: number; count: number }> = {};

    moodEntries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt).toDateString();
      const completionsOnDay = filteredCompletions.filter(
        (c) => new Date(c.completedAt).toDateString() === entryDate
      ).length;

      const bucket = Math.min(completionsOnDay, 5); // Cap at 5+ completions
      if (!moodByCompletions[bucket]) {
        moodByCompletions[bucket] = { total: 0, count: 0 };
      }
      moodByCompletions[bucket].total += entry.moodLevel;
      moodByCompletions[bucket].count += 1;
    });

    return Object.entries(moodByCompletions).map(([completions, data]) => ({
      completions: parseInt(completions),
      avgMood: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    })).sort((a, b) => a.completions - b.completions);
  }, [moodEntries, filteredCompletions]);

  // Weekly trend data
  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; completions: number; rate: number }[] = [];
    const current = new Date(dateRange.start);
    const activeHabits = habits.filter((h) => !h.archived).length;

    while (current <= dateRange.end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);

      const weekCompletions = filteredCompletions.filter((c) => {
        const date = new Date(c.completedAt);
        return date >= weekStart && date < weekEnd;
      }).length;

      const daysInWeek = Math.min(7, Math.ceil((dateRange.end.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
      const possibleCompletions = daysInWeek * activeHabits;
      const rate = possibleCompletions > 0 ? (weekCompletions / possibleCompletions) * 100 : 0;

      weeks.push({
        week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completions: weekCompletions,
        rate,
      });

      current.setDate(current.getDate() + 7);
    }

    return weeks;
  }, [dateRange, filteredCompletions, habits]);

  const selectedHabitData = selectedHabit
    ? habitsWithStats.find((h) => h.id === selectedHabit)
    : null;

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Statistics</h1>
          <p className="text-[var(--text-muted)]">
            Track your progress and analyze your habits
          </p>
        </div>

        {/* Time range tabs */}
        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-xl p-1">
          {(["week", "month", "year", "custom"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                timeRange === range
                  ? "bg-primary-500 text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date picker */}
      {timeRange === "custom" && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">From</label>
                <input
                  type="date"
                  value={customRange.start.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      start: new Date(e.target.value),
                    }))
                  }
                  className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">To</label>
                <input
                  type="date"
                  value={customRange.end.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      end: new Date(e.target.value),
                    }))
                  }
                  className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {overallStats.completionRate.toFixed(0)}%
            </p>
            <p className="text-xs text-[var(--text-muted)]">Completion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {overallStats.totalCompleted}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {overallStats.bestStreak} {getStreakEmoji(overallStats.bestStreak)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Best Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {overallStats.activeStreaks}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Active Streaks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {overallStats.perfectDays}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Perfect Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <PieChart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {overallStats.totalDays}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Days Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Completion Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex flex-wrap gap-1 min-w-fit">
                {heatmapData.map((day, i) => (
                  <div
                    key={i}
                    title={`${day.date.toLocaleDateString()}: ${day.count} completions`}
                    className={cn(
                      "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                      day.level === 0 && "bg-[var(--bg-tertiary)]",
                      day.level === 1 && "bg-green-200 dark:bg-green-900",
                      day.level === 2 && "bg-green-400 dark:bg-green-700",
                      day.level === 3 && "bg-green-500 dark:bg-green-500",
                      day.level === 4 && "bg-green-600 dark:bg-green-400"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-[var(--text-muted)]">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-[var(--bg-tertiary)]" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-400" />
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyTrend.slice(-8).map((week, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">{week.week}</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {week.rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(week.rate, 100)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Habit Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Habit Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habitComparison.slice(0, 6).map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => setSelectedHabit(habit.id)}
                  className="w-full text-left hover:bg-[var(--bg-secondary)] p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{habit.icon}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate flex-1">
                      {habit.name}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {habit.completionRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(habit.completionRate, 100)}%`,
                        backgroundColor: habit.color,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood Correlation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">😊</span>
              Mood vs Habits Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moodCorrelation.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Average mood based on daily habit completions
                </p>
                <div className="space-y-3">
                  {moodCorrelation.map((data) => {
                    const moodEmoji = MOOD_EMOJIS.find(
                      (m) => m.level === Math.round(data.avgMood)
                    );
                    return (
                      <div key={data.completions} className="flex items-center gap-3">
                        <span className="text-sm text-[var(--text-muted)] w-24">
                          {data.completions === 5 ? "5+" : data.completions} habits
                        </span>
                        <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(data.avgMood / 5) * 100}%`,
                              backgroundColor: moodEmoji?.color || "#888",
                            }}
                          />
                        </div>
                        <span className="text-lg">{moodEmoji?.emoji || "😐"}</span>
                        <span className="text-sm text-[var(--text-muted)] w-12">
                          {data.avgMood.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {moodCorrelation.length > 1 && (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    {moodCorrelation[moodCorrelation.length - 1].avgMood >
                    moodCorrelation[0].avgMood
                      ? "More habit completions correlate with better mood!"
                      : "Keep tracking to see patterns!"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-[var(--text-muted)] py-4">
                Log your mood to see correlations with habits
              </p>
            )}
          </CardContent>
        </Card>

        {/* Streaks Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame size={20} />
              Streak Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habitsWithStats
                .filter((h) => h.currentStreak > 0)
                .sort((a, b) => b.currentStreak - a.currentStreak)
                .slice(0, 5)
                .map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]"
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {habit.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Best: {habit.longestStreak} days
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <Flame size={14} className="text-orange-500" />
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {habit.currentStreak}
                      </span>
                    </div>
                  </div>
                ))}
              {habitsWithStats.filter((h) => h.currentStreak > 0).length === 0 && (
                <p className="text-center text-[var(--text-muted)] py-4">
                  Complete habits to start building streaks!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habit Detail Modal */}
      {selectedHabit && selectedHabitData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedHabit(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] shadow-xl max-w-lg w-full p-6"
          >
            <button
              onClick={() => setSelectedHabit(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: selectedHabitData.color + "20" }}
              >
                {selectedHabitData.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {selectedHabitData.name}
                </h2>
                {selectedHabitData.description && (
                  <p className="text-[var(--text-muted)]">
                    {selectedHabitData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] text-center">
                <p className="text-3xl font-bold text-[var(--text-primary)]">
                  {selectedHabitData.currentStreak}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Current Streak</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] text-center">
                <p className="text-3xl font-bold text-[var(--text-primary)]">
                  {selectedHabitData.longestStreak}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Longest Streak</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] text-center">
                <p className="text-3xl font-bold text-[var(--text-primary)]">
                  {selectedHabitData.totalCompletions}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Total Completions</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] text-center">
                <p className="text-3xl font-bold text-[var(--text-primary)]">
                  {habitComparison.find((h) => h.id === selectedHabit)?.completionRate.toFixed(0) || 0}%
                </p>
                <p className="text-sm text-[var(--text-muted)]">Completion Rate</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Recent Activity
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 30 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (29 - i));
                  const hasCompletion = completions.some(
                    (c) =>
                      c.habitId === selectedHabit &&
                      new Date(c.completedAt).toDateString() === date.toDateString()
                  );
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-8 rounded-sm",
                        hasCompletion
                          ? "bg-green-500"
                          : "bg-[var(--bg-tertiary)]"
                      )}
                      title={date.toLocaleDateString()}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-[var(--text-muted)]">Last 30 days</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
