import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useHabitStore } from "@/stores/habitStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { getAllHabitsWithStats } = useHabitStore();
  const { setCurrentPage } = useSettingsStore();
  const habits = getAllHabitsWithStats();

  const filteredHabits = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return habits.filter(
      (h) =>
        h.name.toLowerCase().includes(lowerQuery) ||
        h.description?.toLowerCase().includes(lowerQuery)
    );
  }, [query, habits]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const handleSelectHabit = () => {
    setCurrentPage("habits");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search container */}
          <div className="flex justify-center pt-[15vh]">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-xl mx-4"
            >
              {/* Search input */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  size={20}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search habits..."
                  autoFocus
                  className="w-full h-14 pl-12 pr-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-lg placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Results */}
              <AnimatePresence>
                {query.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden max-h-[50vh] overflow-y-auto"
                  >
                    {filteredHabits.length === 0 ? (
                      <div className="p-4 text-center text-[var(--text-muted)]">
                        No habits found for "{query}"
                      </div>
                    ) : (
                      <div className="p-2">
                        {filteredHabits.map((habit) => (
                          <button
                            key={habit.id}
                            onClick={handleSelectHabit}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors text-left"
                          >
                            <span className="text-2xl">{habit.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text-primary)] truncate">
                                {habit.name}
                              </p>
                              {habit.description && (
                                <p className="text-sm text-[var(--text-muted)] truncate">
                                  {habit.description}
                                </p>
                              )}
                            </div>
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                habit.completedToday
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                              )}
                            >
                              {habit.completedToday ? "Done" : "Pending"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Keyboard hint */}
              <div className="mt-3 text-center text-sm text-[var(--text-muted)]">
                Press <kbd className="px-2 py-1 rounded bg-[var(--bg-secondary)] text-xs">ESC</kbd> to close
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
