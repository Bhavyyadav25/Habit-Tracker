import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { HABIT_COLORS, ICON_PACKS } from "@/lib/constants";
import { useAchievementStore } from "@/stores/achievementStore";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => void;
  initialData?: Habit;
}

export function HabitForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: HabitFormProps) {
  const { getUserStats } = useAchievementStore();
  const userStats = getUserStats();

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || ICON_PACKS.default.icons[0]);
  const [selectedPack, setSelectedPack] = useState<string>("default");
  const [color, setColor] = useState(initialData?.color || HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
    initialData?.frequency || "daily"
  );
  const [customDays, setCustomDays] = useState<number[]>(
    initialData?.customDays || [1, 2, 3, 4, 5] // Default to weekdays (Mon-Fri)
  );
  const [targetCount, setTargetCount] = useState(initialData?.targetCount || 1);

  // Get available icon packs based on user level
  const iconPacks = useMemo(() => {
    return Object.values(ICON_PACKS).map((pack) => ({
      ...pack,
      isUnlocked: userStats.level >= pack.levelRequired,
    }));
  }, [userStats.level]);

  // Get current icons from selected pack
  const currentIcons = useMemo(() => {
    const pack = ICON_PACKS[selectedPack as keyof typeof ICON_PACKS];
    return pack?.icons || ICON_PACKS.default.icons;
  }, [selectedPack]);

  const DAYS_OF_WEEK = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      targetCount,
    });

    // Reset form
    setName("");
    setDescription("");
    setIcon(ICON_PACKS.default.icons[0]);
    setSelectedPack("default");
    setColor(HABIT_COLORS[0]);
    setFrequency("daily");
    setCustomDays([1, 2, 3, 4, 5]);
    setTargetCount(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Habit" : "Create New Habit"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <Input
          label="Habit Name"
          placeholder="e.g., Drink water, Exercise, Read..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Description */}
        <Input
          label="Description (optional)"
          placeholder="What's this habit about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Icon selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Icon
          </label>

          {/* Icon pack tabs */}
          <div className="flex flex-wrap gap-1 mb-3 p-1 bg-[var(--bg-secondary)] rounded-xl">
            {iconPacks.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => pack.isUnlocked && setSelectedPack(pack.id)}
                disabled={!pack.isUnlocked}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  selectedPack === pack.id
                    ? "bg-primary-500 text-white"
                    : pack.isUnlocked
                    ? "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    : "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                )}
              >
                {!pack.isUnlocked && <Lock size={10} />}
                {pack.name}
                {!pack.isUnlocked && (
                  <span className="text-[10px] opacity-70">Lv{pack.levelRequired}</span>
                )}
              </button>
            ))}
          </div>

          {/* Icons grid */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
            {currentIcons.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIcon(emoji)}
                className={cn(
                  "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors",
                  icon === emoji
                    ? "bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500"
                    : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]"
                )}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((c) => (
              <motion.button
                key={c}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setColor(c)}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  color === c && "ring-2 ring-offset-2 ring-offset-[var(--bg-primary)]"
                )}
                style={{
                  backgroundColor: c,
                  ringColor: c,
                }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Frequency
          </label>
          <div className="flex gap-2">
            {(["daily", "weekly", "custom"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
                  frequency === f
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Custom days selector */}
          {frequency === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <p className="text-sm text-[var(--text-muted)] mb-2">
                Select days for this habit:
              </p>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <motion.button
                    key={day.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                      customDays.includes(day.value)
                        ? "bg-primary-500 text-white"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    {day.label}
                  </motion.button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please select at least one day
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Target count */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Daily Target
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)]"
            >
              -
            </button>
            <span className="w-12 text-center text-xl font-medium text-[var(--text-primary)]">
              {targetCount}
            </span>
            <button
              type="button"
              onClick={() => setTargetCount(targetCount + 1)}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-tertiary)]"
            >
              +
            </button>
            <span className="text-sm text-[var(--text-muted)]">
              times per {frequency === "weekly" ? "week" : "day"}
            </span>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={!name.trim() || (frequency === "custom" && customDays.length === 0)}
          >
            {initialData ? "Save Changes" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
