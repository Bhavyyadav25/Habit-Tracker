import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Timer,
  Bot,
  Database,
  Download,
  Lock,
  Palette,
  Volume2,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useHabitStore } from "@/stores/habitStore";
import { useMoodStore } from "@/stores/moodStore";
import { useAchievementStore } from "@/stores/achievementStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { UNLOCKABLE_THEMES, SOUND_EFFECTS } from "@/lib/constants";
import { playCompletionSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import type { ColorTheme, SoundPack } from "@/types";

export function SettingsPage() {
  const { settings, updateSettings, setTheme, setColorTheme } = useSettingsStore();
  const { habits, completions } = useHabitStore();
  const { entries: moodEntries } = useMoodStore();
  const { getUserStats } = useAchievementStore();
  const userStats = getUserStats();

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      habits,
      completions,
      moodEntries,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habitflow-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Export habits as CSV
    const headers = ["Name", "Description", "Icon", "Frequency", "Target", "Created"];
    const rows = habits.map((h) => [
      h.name,
      h.description || "",
      h.icon,
      h.frequency,
      h.targetCount.toString(),
      h.createdAt,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habitflow-habits-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Appearance */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun size={20} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">Theme</p>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setTheme(theme)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors capitalize",
                        settings.theme === theme
                          ? "bg-primary-500 text-white"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      )}
                    >
                      {theme === "light" && <Sun size={16} />}
                      {theme === "dark" && <Moon size={16} />}
                      {theme === "system" && <Monitor size={16} />}
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Section */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-[var(--text-secondary)]">Color Theme</p>
                  <span className="text-xs text-[var(--text-muted)]">
                    Level {userStats.level}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.values(UNLOCKABLE_THEMES).map((theme) => {
                    const isUnlocked = userStats.level >= theme.levelRequired;
                    const isSelected = settings.colorTheme === theme.id;

                    return (
                      <button
                        key={theme.id}
                        onClick={() => isUnlocked && setColorTheme(theme.id as ColorTheme)}
                        disabled={!isUnlocked}
                        className={cn(
                          "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                          isSelected
                            ? "bg-primary-500 text-white ring-2 ring-primary-500 ring-offset-2 ring-offset-[var(--bg-primary)]"
                            : isUnlocked
                            ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                            : "bg-[var(--bg-secondary)] text-[var(--text-muted)] opacity-60 cursor-not-allowed"
                        )}
                      >
                        {/* Color preview */}
                        <div className="flex gap-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                        <span className="text-sm font-medium">{theme.name}</span>

                        {/* Lock badge for locked themes */}
                        {!isUnlocked && (
                          <div className="absolute -top-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                            <Lock size={10} />
                            <span className="text-xs">Lv{theme.levelRequired}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  Unlock more themes by leveling up! Visit Achievements to see your progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sound Effects */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 size={20} />
              Sound Effects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Enable/disable sounds */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)]">Enable sounds</span>
                <button
                  onClick={() =>
                    updateSettings({ soundEnabled: !settings.soundEnabled })
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    settings.soundEnabled
                      ? "bg-primary-500"
                      : "bg-[var(--bg-tertiary)]"
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    animate={{
                      left: settings.soundEnabled
                        ? "calc(100% - 20px)"
                        : "4px",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Sound pack selector */}
              {settings.soundEnabled && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Sound Pack
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(SOUND_EFFECTS).map((pack) => {
                      const isUnlocked = userStats.level >= pack.levelRequired;
                      const isSelected = settings.soundPack === pack.id;

                      return (
                        <button
                          key={pack.id}
                          onClick={() => {
                            if (isUnlocked) {
                              updateSettings({ soundPack: pack.id as SoundPack });
                              // Play preview sound
                              playCompletionSound(pack.id as SoundPack);
                            }
                          }}
                          disabled={!isUnlocked}
                          className={cn(
                            "relative flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                            isSelected
                              ? "bg-primary-500 text-white"
                              : isUnlocked
                              ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                              : "bg-[var(--bg-secondary)] text-[var(--text-muted)] opacity-60 cursor-not-allowed"
                          )}
                        >
                          <span className="text-xl">
                            {pack.id === "default" && "🔔"}
                            {pack.id === "chime" && "🎵"}
                            {pack.id === "nature" && "🍃"}
                            {pack.id === "gaming" && "🎮"}
                          </span>
                          <span className="font-medium">{pack.name}</span>
                          {!isUnlocked && (
                            <div className="absolute -top-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                              <Lock size={10} />
                              <span className="text-xs">Lv{pack.levelRequired}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-3">
                    Click a sound pack to preview it
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: "enabled", label: "Enable notifications" },
                { key: "habitReminders", label: "Habit reminders" },
                { key: "breakReminders", label: "Break reminders" },
                { key: "pomodoroAlerts", label: "Pomodoro alerts" },
                { key: "dailySummary", label: "Daily summary" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[var(--text-primary)]">{item.label}</span>
                  <button
                    onClick={() =>
                      updateSettings({
                        notifications: {
                          ...settings.notifications,
                          [item.key]:
                            !settings.notifications[
                              item.key as keyof typeof settings.notifications
                            ],
                        },
                      })
                    }
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      settings.notifications[
                        item.key as keyof typeof settings.notifications
                      ]
                        ? "bg-primary-500"
                        : "bg-[var(--bg-tertiary)]"
                    )}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                      animate={{
                        left: settings.notifications[
                          item.key as keyof typeof settings.notifications
                        ]
                          ? "calc(100% - 20px)"
                          : "4px",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Break Reminders */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer size={20} />
              Break Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)]">Enable break reminders</span>
                <button
                  onClick={() =>
                    updateSettings({
                      breakReminders: {
                        ...settings.breakReminders,
                        enabled: !settings.breakReminders.enabled,
                      },
                    })
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    settings.breakReminders.enabled
                      ? "bg-primary-500"
                      : "bg-[var(--bg-tertiary)]"
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    animate={{
                      left: settings.breakReminders.enabled
                        ? "calc(100% - 20px)"
                        : "4px",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {settings.breakReminders.enabled && (
                <>
                  <div>
                    <label className="text-sm text-[var(--text-secondary)]">
                      Reminder interval (minutes)
                    </label>
                    <Input
                      type="number"
                      min={5}
                      max={120}
                      value={settings.breakReminders.intervalMinutes}
                      onChange={(e) =>
                        updateSettings({
                          breakReminders: {
                            ...settings.breakReminders,
                            intervalMinutes: parseInt(e.target.value) || 30,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: "hydrationReminder", label: "💧 Hydration reminder" },
                      { key: "stretchReminder", label: "🧘 Stretch reminder" },
                      { key: "eyeRestReminder", label: "👀 Eye rest reminder" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            settings.breakReminders[
                              item.key as keyof typeof settings.breakReminders
                            ] as boolean
                          }
                          onChange={() =>
                            updateSettings({
                              breakReminders: {
                                ...settings.breakReminders,
                                [item.key]:
                                  !settings.breakReminders[
                                    item.key as keyof typeof settings.breakReminders
                                  ],
                              },
                            })
                          }
                          className="w-4 h-4 rounded accent-primary-500"
                        />
                        <span className="text-[var(--text-primary)]">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Settings */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot size={20} />
              AI Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">AI Provider</p>
                <div className="flex flex-wrap gap-2">
                  {(["none", "ollama", "openai", "claude"] as const).map((provider) => (
                    <button
                      key={provider}
                      onClick={() =>
                        updateSettings({
                          ai: { ...settings.ai, provider },
                        })
                      }
                      className={cn(
                        "px-4 py-2 rounded-xl transition-colors capitalize",
                        settings.ai.provider === provider
                          ? "bg-primary-500 text-white"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      )}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {settings.ai.provider === "ollama" && (
                <div className="space-y-3">
                  <Input
                    label="Ollama Endpoint"
                    value={settings.ai.ollamaEndpoint}
                    onChange={(e) =>
                      updateSettings({
                        ai: { ...settings.ai, ollamaEndpoint: e.target.value },
                      })
                    }
                    placeholder="http://localhost:11434"
                  />
                  <Input
                    label="Model"
                    value={settings.ai.ollamaModel}
                    onChange={(e) =>
                      updateSettings({
                        ai: { ...settings.ai, ollamaModel: e.target.value },
                      })
                    }
                    placeholder="llama2"
                  />
                </div>
              )}

              {settings.ai.provider === "openai" && (
                <Input
                  label="OpenAI API Key"
                  type="password"
                  value={settings.ai.openaiApiKey || ""}
                  onChange={(e) =>
                    updateSettings({
                      ai: { ...settings.ai, openaiApiKey: e.target.value },
                    })
                  }
                  placeholder="sk-..."
                />
              )}

              {settings.ai.provider === "claude" && (
                <Input
                  label="Claude API Key"
                  type="password"
                  value={settings.ai.claudeApiKey || ""}
                  onChange={(e) =>
                    updateSettings({
                      ai: { ...settings.ai, claudeApiKey: e.target.value },
                    })
                  }
                  placeholder="sk-ant-..."
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data & Export */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              Data & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">
                Export your data for backup or analysis
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleExportJSON}>
                  <Download size={16} />
                  Export JSON
                </Button>
                <Button variant="secondary" onClick={handleExportCSV}>
                  <Download size={16} />
                  Export CSV
                </Button>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {habits.length} habits • {completions.length} completions •{" "}
                {moodEntries.length} mood entries
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
