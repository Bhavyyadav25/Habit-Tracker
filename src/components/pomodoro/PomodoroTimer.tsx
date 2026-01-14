import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain } from "lucide-react";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { useAchievementStore, XP_REWARDS } from "@/stores/achievementStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { formatTime, cn } from "@/lib/utils";

export function PomodoroTimer() {
  const {
    timerState,
    currentSessionType,
    timeRemaining,
    sessionsCompleted,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipSession,
    tick,
    getTodaySessions,
  } = usePomodoroStore();

  const { addXp, checkAchievements } = useAchievementStore();
  const prevTimeRef = useRef(timeRemaining);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState === "running") {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, tick]);

  // Check for session completion
  useEffect(() => {
    if (prevTimeRef.current > 0 && timeRemaining === 0) {
      // Session completed
      if (currentSessionType === "work") {
        addXp(XP_REWARDS.pomodoroComplete, "Pomodoro session completed");
        const workSessions = getTodaySessions().filter(
          (s) => s.type === "work" && s.completed
        );
        checkAchievements({ pomodoroCount: workSessions.length });
      }

      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining, currentSessionType, addXp, checkAchievements, getTodaySessions]);

  const totalDuration =
    currentSessionType === "work"
      ? settings.workDuration
      : currentSessionType === "short_break"
      ? settings.shortBreakDuration
      : settings.longBreakDuration;

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  const getSessionLabel = () => {
    switch (currentSessionType) {
      case "work":
        return "Focus Time";
      case "short_break":
        return "Short Break";
      case "long_break":
        return "Long Break";
    }
  };

  const getSessionIcon = () => {
    switch (currentSessionType) {
      case "work":
        return <Brain size={24} />;
      case "short_break":
      case "long_break":
        return <Coffee size={24} />;
    }
  };

  const getSessionColor = () => {
    switch (currentSessionType) {
      case "work":
        return "#6366f1";
      case "short_break":
        return "#22c55e";
      case "long_break":
        return "#0ea5e9";
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="py-8">
        {/* Hidden audio element */}
        <audio ref={audioRef} preload="auto">
          <source
            src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQMEC6rs4dqdSQALK8r47MltCQAINu/69mYCAAM9+vrzXAAACEH79uxR"
            type="audio/wav"
          />
        </audio>

        {/* Session type indicator */}
        <div className="text-center mb-6">
          <motion.div
            key={currentSessionType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: `${getSessionColor()}20` }}
          >
            <span style={{ color: getSessionColor() }}>{getSessionIcon()}</span>
            <span
              className="font-medium"
              style={{ color: getSessionColor() }}
            >
              {getSessionLabel()}
            </span>
          </motion.div>
        </div>

        {/* Timer ring */}
        <div className="flex justify-center mb-8">
          <ProgressRing
            progress={progress}
            size={220}
            strokeWidth={12}
            color={getSessionColor()}
            showPercentage={false}
          >
            <div className="text-center">
              <motion.div
                key={timeRemaining}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-[var(--text-primary)] font-mono"
              >
                {formatTime(timeRemaining)}
              </motion.div>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Session {sessionsCompleted + 1}
              </p>
            </div>
          </ProgressRing>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={resetTimer}
            disabled={timerState === "idle" && timeRemaining === totalDuration}
          >
            <RotateCcw size={20} />
          </Button>

          {timerState === "idle" ? (
            <Button
              size="lg"
              onClick={() => startTimer()}
              className="px-8"
              style={{ backgroundColor: getSessionColor() }}
            >
              <Play size={24} />
              Start
            </Button>
          ) : timerState === "running" ? (
            <Button
              size="lg"
              onClick={pauseTimer}
              className="px-8"
              style={{ backgroundColor: getSessionColor() }}
            >
              <Pause size={24} />
              Pause
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={resumeTimer}
              className="px-8"
              style={{ backgroundColor: getSessionColor() }}
            >
              <Play size={24} />
              Resume
            </Button>
          )}

          <Button variant="secondary" size="icon" onClick={skipSession}>
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Session progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                i < sessionsCompleted % settings.sessionsUntilLongBreak
                  ? "bg-primary-500"
                  : "bg-[var(--bg-tertiary)]"
              )}
            />
          ))}
        </div>

        {/* Today's stats */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {getTodaySessions().filter((s) => s.type === "work" && s.completed).length}
              </p>
              <p className="text-[var(--text-muted)]">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {Math.floor(
                  getTodaySessions()
                    .filter((s) => s.type === "work" && s.completed)
                    .reduce((acc, s) => acc + s.duration, 0) / 60
                )}
              </p>
              <p className="text-[var(--text-muted)]">Minutes focused</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
