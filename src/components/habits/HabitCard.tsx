import { motion } from "framer-motion";
import { Flame, MoreVertical, Trash2, Edit2, Archive } from "lucide-react";
import { cn, getStreakEmoji } from "@/lib/utils";
import { flame } from "@/lib/animations";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { Button } from "@/components/ui/Button";
import type { HabitWithStats } from "@/types";

interface HabitCardProps {
  habit: HabitWithStats;
  onComplete: () => void;
  onUncomplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  isMenuOpen: boolean;
  onMenuToggle: (isOpen: boolean) => void;
}

export function HabitCard({
  habit,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  onArchive,
  isMenuOpen,
  onMenuToggle,
}: HabitCardProps) {

  const handleToggle = (checked: boolean) => {
    // Close any open menu first
    if (isMenuOpen) {
      onMenuToggle(false);
    }
    if (checked) {
      onComplete();
    } else {
      onUncomplete();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border)] hover:shadow-lg transition-shadow",
        isMenuOpen && "z-[102]"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <AnimatedCheckbox
          checked={habit.completedToday}
          onChange={handleToggle}
          color={habit.color}
          size="lg"
          showConfetti={true}
        />

        {/* Icon and name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <h3
              className={cn(
                "font-medium text-[var(--text-primary)] truncate",
                habit.completedToday && "line-through opacity-60"
              )}
            >
              {habit.name}
            </h3>
          </div>
          {habit.description && (
            <p className="text-sm text-[var(--text-muted)] truncate mt-0.5">
              {habit.description}
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2">
          {habit.currentStreak > 0 && (
            <motion.div
              variants={flame}
              animate="idle"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
                habit.currentStreak >= 7
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              )}
            >
              <span>{getStreakEmoji(habit.currentStreak)}</span>
              <span>{habit.currentStreak}</span>
              {habit.currentStreak >= 7 && (
                <Flame size={14} className="text-orange-500" />
              )}
            </motion.div>
          )}

          {/* Menu button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(!isMenuOpen);
              }}
              className="h-8 w-8"
            >
              <MoreVertical size={16} />
            </Button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => onMenuToggle(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 z-[101] bg-[var(--bg-primary)] rounded-xl shadow-lg border border-[var(--border)] py-1 min-w-[140px]"
                >
                  <button
                    onClick={() => {
                      onEdit();
                      onMenuToggle(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onArchive();
                      onMenuToggle(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  >
                    <Archive size={14} />
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      onMenuToggle(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for multi-count habits */}
      {habit.targetCount > 1 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Progress</span>
            <span>
              {habit.todayCount} / {habit.targetCount}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: habit.color }}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (habit.todayCount / habit.targetCount) * 100)}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Color accent */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: habit.color }}
      />
    </motion.div>
  );
}
