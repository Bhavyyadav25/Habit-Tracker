import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useMoodStore } from "@/stores/moodStore";
import { useAchievementStore, XP_REWARDS } from "@/stores/achievementStore";
import { MOOD_EMOJIS, EMOTION_TAGS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { bounceIn, breathe } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function MoodPicker() {
  const { getTodayMood, addMoodEntry, updateMoodEntry } = useMoodStore();
  const { addXp, checkAchievements } = useAchievementStore();

  const todayMood = getTodayMood();
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(
    todayMood?.moodLevel || null
  );
  const [showJournal, setShowJournal] = useState(false);
  const [journal, setJournal] = useState(todayMood?.journal || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(todayMood?.tags || []);

  const handleMoodSelect = async (level: 1 | 2 | 3 | 4 | 5) => {
    setSelectedMood(level);
    const emoji = MOOD_EMOJIS.find((m) => m.level === level)!.emoji;

    if (todayMood) {
      await updateMoodEntry(todayMood.id, {
        moodLevel: level,
        emoji,
      });
    } else {
      await addMoodEntry({
        moodLevel: level,
        emoji,
        tags: [],
      });

      // Add XP for logging mood
      addXp(XP_REWARDS.moodLog, "Logged daily mood");

      // Check mood streak
      const moodStreak = useMoodStore.getState().getMoodStreak();
      await checkAchievements({ moodStreak });
    }
  };

  const handleSaveJournal = async () => {
    if (todayMood) {
      await updateMoodEntry(todayMood.id, {
        journal: journal.trim() || undefined,
        tags: selectedTags,
      });

      if (journal.trim()) {
        addXp(XP_REWARDS.journalEntry, "Journal entry");
      }
    }
    setShowJournal(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        {selectedMood && (
          <Button variant="ghost" size="sm" onClick={() => setShowJournal(!showJournal)}>
            Add note
            <ChevronRight
              size={16}
              className={cn("transition-transform", showJournal && "rotate-90")}
            />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Mood selector */}
        <div className="flex justify-center gap-3 mb-4">
          {MOOD_EMOJIS.map((mood) => (
            <motion.button
              key={mood.level}
              variants={bounceIn}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSelect(mood.level)}
              className={cn(
                "relative w-14 h-14 text-3xl rounded-2xl transition-all",
                selectedMood === mood.level
                  ? "bg-opacity-100 shadow-lg scale-110"
                  : "bg-[var(--bg-tertiary)] hover:bg-opacity-70"
              )}
              style={{
                backgroundColor:
                  selectedMood === mood.level
                    ? `${mood.color}30`
                    : undefined,
              }}
            >
              <motion.span
                animate={
                  selectedMood === mood.level
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                {mood.emoji}
              </motion.span>
              {selectedMood === mood.level && (
                <motion.div
                  layoutId="mood-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: mood.color }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Selected mood label */}
        <AnimatePresence>
          {selectedMood && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-[var(--text-secondary)] mb-4"
            >
              You're feeling{" "}
              <span
                className="font-medium"
                style={{ color: MOOD_EMOJIS[selectedMood - 1].color }}
              >
                {MOOD_EMOJIS[selectedMood - 1].label.toLowerCase()}
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Journal section */}
        <AnimatePresence>
          {showJournal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Emotion tags */}
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  What's on your mind?
                </p>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-primary-500 text-white"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                      )}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Journal textarea */}
              <Textarea
                placeholder="Write about your day... (optional)"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="min-h-[100px]"
              />

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowJournal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveJournal} className="flex-1">
                  Save
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing exercise hint */}
        {!showJournal && selectedMood && selectedMood <= 2 && (
          <motion.div
            variants={breathe}
            animate="idle"
            className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center"
          >
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Take a deep breath. You're doing great. 💙
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
