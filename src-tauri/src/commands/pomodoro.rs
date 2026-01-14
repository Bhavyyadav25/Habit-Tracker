use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct PomodoroSession {
    pub id: String,
    #[serde(rename = "habitId")]
    pub habit_id: Option<String>,
    pub duration: i32,
    #[serde(rename = "type")]
    pub session_type: String,
    pub completed: bool,
    #[serde(rename = "startedAt")]
    pub started_at: String,
    #[serde(rename = "endedAt")]
    pub ended_at: Option<String>,
}

#[tauri::command]
pub fn get_pomodoro_sessions(state: State<AppState>) -> Result<Vec<PomodoroSession>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db.conn.prepare(
        "SELECT id, habit_id, duration, type, completed, started_at, ended_at
         FROM pomodoro_sessions ORDER BY started_at DESC"
    ).map_err(|e| e.to_string())?;

    let sessions = stmt.query_map([], |row| {
        Ok(PomodoroSession {
            id: row.get(0)?,
            habit_id: row.get(1)?,
            duration: row.get(2)?,
            session_type: row.get(3)?,
            completed: row.get::<_, i32>(4)? != 0,
            started_at: row.get(5)?,
            ended_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    sessions.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_pomodoro_session(state: State<AppState>, session: PomodoroSession) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.conn.execute(
        "INSERT INTO pomodoro_sessions (id, habit_id, duration, type, completed, started_at, ended_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            &session.id,
            &session.habit_id,
            session.duration,
            &session.session_type,
            if session.completed { 1 } else { 0 },
            &session.started_at,
            &session.ended_at,
        ),
    ).map_err(|e| e.to_string())?;

    Ok(())
}
