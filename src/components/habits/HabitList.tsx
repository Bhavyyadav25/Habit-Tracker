import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Package } from "lucide-react";
import { useHabitStore } from "@/stores/habitStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAchievementStore, XP_REWARDS } from "@/stores/achievementStore";
import { HabitCard } from "./HabitCard";
import { HabitForm } from "./HabitForm";
import { HabitTemplates } from "./HabitTemplates";
import { Button } from "@/components/ui/Button";
import { playCompletionSound } from "@/lib/sounds";
import type { Habit, SoundPack } from "@/types";

export function HabitList() {
  const {
    getAllHabitsWithStats,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    completeHabit,
    uncompleteHabit,
  } = useHabitStore();
  const { settings } = useSettingsStore();
  const { addXp, checkAchievements } = useAchievementStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const habits = getAllHabitsWithStats();

  const handleImportTemplate = async (
    templateHabits: Array<{ name: string; icon: string; color: string }>
  ) => {
    for (const habit of templateHabits) {
      await addHabit({
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        frequency: "daily",
        targetCount: 1,
      });
    }
    const allHabits = useHabitStore.getState().habits;
    await checkAchievements({ habitCount: allHabits.length });
  };

  const handleCreateHabit = async (
    habitData: Omit<Habit, "id" | "createdAt" | "archived">
  ) => {
    await addHabit(habitData);
    const allHabits = useHabitStore.getState().habits;
    await checkAchievements({ habitCount: allHabits.length });
  };

  const handleEditHabit = async (
    habitData: Omit<Habit, "id" | "createdAt" | "archived">
  ) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
    }
  };

  const closeMenu = () => setOpenMenuId(null);

  const handleComplete = async (habitId: string) => {
    closeMenu();
    await completeHabit(habitId);

    // Play completion sound
    if (settings.soundEnabled) {
      playCompletionSound(settings.soundPack as SoundPack);
    }

    // Add XP
    const habit = useHabitStore.getState().getHabitWithStats(habitId);
    if (habit) {
      const streakBonus = Math.min(habit.currentStreak * XP_REWARDS.streakBonus, 50);
      addXp(XP_REWARDS.habitComplete + streakBonus, `Completed: ${habit.name}`);

      // Check streak achievements
      await checkAchievements({
        habitStreak: habit.currentStreak,
        hour: new Date().getHours(),
      });
    }
  };

  const handleUncomplete = async (habitId: string) => {
    closeMenu();
    await uncompleteHabit(habitId);
  };

  const handleEdit = (habit: Habit) => {
    closeMenu();
    setEditingHabit(habit);
  };

  const handleDelete = async (habitId: string) => {
    closeMenu();
    await deleteHabit(habitId);
  };

  const handleArchive = async (habitId: string) => {
    closeMenu();
    await archiveHabit(habitId);
  };

  return (
    <div className="space-y-4" onClick={closeMenu}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Today's Habits
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {habits.filter((h) => h.completedToday).length} of {habits.length} completed
          </p>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            onClick={() => setIsTemplatesOpen(true)}
          >
            <Package size={18} />
            Templates
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Habits list */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
            No habits yet
          </h3>
          <p className="text-[var(--text-muted)] mb-4">
            Create your first habit to start building better routines
          </p>
          <Button onClick={(e) => { e.stopPropagation(); setIsFormOpen(true); }}>
            <Plus size={18} />
            Create First Habit
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onComplete={() => handleComplete(habit.id)}
              onUncomplete={() => handleUncomplete(habit.id)}
              onEdit={() => handleEdit(habit)}
              onDelete={() => handleDelete(habit.id)}
              onArchive={() => handleArchive(habit.id)}
              isMenuOpen={openMenuId === habit.id}
              onMenuToggle={(isOpen) => setOpenMenuId(isOpen ? habit.id : null)}
            />
          ))}
        </div>
      )}

      {/* Create habit form */}
      <HabitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateHabit}
      />

      {/* Edit habit form */}
      <HabitForm
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        onSubmit={handleEditHabit}
        initialData={editingHabit || undefined}
      />

      {/* Habit templates */}
      <HabitTemplates
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onImport={handleImportTemplate}
      />
    </div>
  );
}
