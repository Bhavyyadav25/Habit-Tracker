import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock, Gift, Palette, Music, FileText, Sparkles } from "lucide-react";
import { useAchievementStore } from "@/stores/achievementStore";
import { LEVEL_UNLOCKS, type LevelUnlock } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const typeIcons: Record<LevelUnlock["type"], React.ReactNode> = {
  theme: <Palette size={16} />,
  icons: <span className="text-sm">🎨</span>,
  template: <FileText size={16} />,
  sound: <Music size={16} />,
  feature: <Sparkles size={16} />,
  badge: <span className="text-sm">🎖️</span>,
};

const typeColors: Record<LevelUnlock["type"], string> = {
  theme: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  icons: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  template: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  sound: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  feature: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  badge: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export function LevelUnlocks() {
  const { getUserStats } = useAchievementStore();
  const userStats = getUserStats();

  // Group unlocks by level milestones
  const groupedUnlocks = useMemo(() => {
    const groups: Record<number, LevelUnlock[]> = {};
    LEVEL_UNLOCKS.forEach((unlock) => {
      if (!groups[unlock.levelRequired]) {
        groups[unlock.levelRequired] = [];
      }
      groups[unlock.levelRequired].push(unlock);
    });
    return groups;
  }, []);

  const levels = Object.keys(groupedUnlocks)
    .map(Number)
    .sort((a, b) => a - b);

  // Find next unlock level
  const nextUnlockLevel = levels.find((level) => level > userStats.level) || levels[levels.length - 1];

  // Recently unlocked (current level)
  const recentlyUnlocked = LEVEL_UNLOCKS.filter(
    (u) => u.levelRequired <= userStats.level && u.levelRequired > userStats.level - 5
  );

  // Next unlocks
  const nextUnlocks = LEVEL_UNLOCKS.filter(
    (u) => u.levelRequired === nextUnlockLevel
  );

  const unlockedCount = LEVEL_UNLOCKS.filter((u) => u.levelRequired <= userStats.level).length;
  const totalUnlocks = LEVEL_UNLOCKS.length;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-primary-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {unlockedCount} / {totalUnlocks}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Rewards Unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              Level {nextUnlockLevel}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Next Rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-2xl">🎁</div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {nextUnlocks.length}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Waiting to Unlock</p>
          </CardContent>
        </Card>
      </div>

      {/* Recently Unlocked */}
      {recentlyUnlocked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              Recently Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recentlyUnlocked.map((unlock) => (
                <motion.div
                  key={unlock.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30"
                >
                  <span className="text-xl">{unlock.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{unlock.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Level {unlock.levelRequired}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Unlocks Preview */}
      {nextUnlocks.length > 0 && userStats.level < 50 && (
        <Card className="border-dashed border-2 border-primary-300 dark:border-primary-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="text-primary-500" size={20} />
              Unlock at Level {nextUnlockLevel}
              <span className="ml-auto text-sm font-normal text-[var(--text-muted)]">
                {nextUnlockLevel - userStats.level} level{nextUnlockLevel - userStats.level > 1 ? "s" : ""} away
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nextUnlocks.map((unlock) => (
                <div
                  key={unlock.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] opacity-75"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-xl">
                    {unlock.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{unlock.name}</p>
                    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-1", typeColors[unlock.type])}>
                      {typeIcons[unlock.type]}
                      <span className="capitalize">{unlock.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Unlocks by Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift size={20} />
            All Rewards by Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {levels.map((level) => {
              const unlocks = groupedUnlocks[level];
              const isUnlocked = userStats.level >= level;
              const isCurrent = userStats.level === level;

              return (
                <div key={level} className="relative">
                  {/* Level marker */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        isUnlocked
                          ? "bg-primary-500 text-white"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                      )}
                    >
                      {level}
                    </div>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    {isCurrent && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                        Current
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="text-xs text-[var(--text-muted)]">
                        <Lock size={12} className="inline mr-1" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Unlocks grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-12">
                    {unlocks.map((unlock) => (
                      <motion.div
                        key={unlock.id}
                        whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all",
                          isUnlocked
                            ? "bg-[var(--bg-secondary)] border-[var(--border)]"
                            : "bg-[var(--bg-primary)] border-dashed border-[var(--border)] opacity-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                            isUnlocked
                              ? "bg-gradient-to-br from-primary-400 to-primary-600"
                              : "bg-[var(--bg-tertiary)]"
                          )}
                        >
                          {isUnlocked ? unlock.icon : <Lock size={16} className="text-[var(--text-muted)]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium truncate",
                            isUnlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                          )}>
                            {unlock.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {unlock.description}
                          </p>
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-1",
                            isUnlocked ? typeColors[unlock.type] : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                          )}>
                            {typeIcons[unlock.type]}
                            <span className="capitalize">{unlock.type}</span>
                          </div>
                        </div>
                        {isUnlocked && (
                          <div className="text-green-500">✓</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
