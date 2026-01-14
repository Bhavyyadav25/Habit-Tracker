use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = get_database_path();

        // Ensure directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        let db = Database { conn };
        db.initialize()?;
        Ok(db)
    }

    fn initialize(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            -- Habits table
            CREATE TABLE IF NOT EXISTS habits (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                frequency TEXT NOT NULL,
                target_count INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                archived INTEGER NOT NULL DEFAULT 0
            );

            -- Habit completions
            CREATE TABLE IF NOT EXISTS habit_completions (
                id TEXT PRIMARY KEY,
                habit_id TEXT NOT NULL,
                completed_at TEXT NOT NULL,
                count INTEGER NOT NULL DEFAULT 1,
                notes TEXT,
                FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
            );

            -- Mood entries
            CREATE TABLE IF NOT EXISTS mood_entries (
                id TEXT PRIMARY KEY,
                mood_level INTEGER NOT NULL,
                emoji TEXT NOT NULL,
                journal TEXT,
                tags TEXT,
                created_at TEXT NOT NULL
            );

            -- Pomodoro sessions
            CREATE TABLE IF NOT EXISTS pomodoro_sessions (
                id TEXT PRIMARY KEY,
                habit_id TEXT,
                duration INTEGER NOT NULL,
                type TEXT NOT NULL,
                completed INTEGER NOT NULL,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE SET NULL
            );

            -- Achievements
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                unlocked_at TEXT NOT NULL,
                data TEXT
            );

            -- Settings
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id);
            CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(completed_at);
            CREATE INDEX IF NOT EXISTS idx_mood_date ON mood_entries(created_at);
            CREATE INDEX IF NOT EXISTS idx_pomodoro_date ON pomodoro_sessions(started_at);
            "
        )?;
        Ok(())
    }
}

fn get_database_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("habitflow");
    path.push("habitflow.db");
    path
}
