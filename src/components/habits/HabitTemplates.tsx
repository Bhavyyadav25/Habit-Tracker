import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock, Package, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { HABIT_TEMPLATES } from "@/lib/constants";
import { useAchievementStore } from "@/stores/achievementStore";
import { cn } from "@/lib/utils";

interface HabitTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (habits: Array<{ name: string; icon: string; color: string }>) => void;
}

export function HabitTemplates({ isOpen, onClose, onImport }: HabitTemplatesProps) {
  const { getUserStats } = useAchievementStore();
  const userStats = getUserStats();

  const templates = useMemo(() => {
    return Object.values(HABIT_TEMPLATES).map((template) => ({
      ...template,
      isUnlocked: userStats.level >= template.levelRequired,
    }));
  }, [userStats.level]);

  const handleImport = (template: (typeof templates)[0]) => {
    if (!template.isUnlocked) return;

    onImport(
      template.habits.map((h) => ({
        name: h.name,
        icon: h.icon,
        color: h.color,
      }))
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Habit Templates" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          Import pre-made habit packs to get started quickly. Higher levels unlock more templates!
        </p>

        <div className="grid gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: template.isUnlocked ? 1.01 : 1 }}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                template.isUnlocked
                  ? "bg-[var(--bg-secondary)] border-[var(--border)] cursor-pointer hover:border-primary-500"
                  : "bg-[var(--bg-primary)] border-dashed border-[var(--border)] opacity-60"
              )}
              onClick={() => handleImport(template)}
            >
              <div className="flex items-start gap-4">
                {/* Template icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                    template.isUnlocked
                      ? "bg-gradient-to-br from-primary-400 to-primary-600"
                      : "bg-[var(--bg-tertiary)]"
                  )}
                >
                  {template.isUnlocked ? template.icon : <Lock size={24} className="text-[var(--text-muted)]" />}
                </div>

                {/* Template info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-semibold",
                      template.isUnlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                    )}>
                      {template.name}
                    </h3>
                    {!template.isUnlocked && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-xs text-[var(--text-muted)]">
                        <Lock size={10} />
                        Level {template.levelRequired}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {template.description}
                  </p>

                  {/* Habit preview */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {template.habits.map((habit, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
                          template.isUnlocked
                            ? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                            : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                        )}
                      >
                        <span>{habit.icon}</span>
                        <span>{habit.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow for unlocked */}
                {template.isUnlocked && (
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            Your level: {userStats.level}
          </p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
