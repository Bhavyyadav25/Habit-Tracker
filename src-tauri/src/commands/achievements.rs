use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct Achievement {
    pub id: String,
    #[serde(rename = "type")]
    pub achievement_type: String,
    #[serde(rename = "unlockedAt")]
    pub unlocked_at: String,
    pub data: Option<serde_json::Value>,
}

#[tauri::command]
pub fn get_achievements(state: State<AppState>) -> Result<Vec<Achievement>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db.conn.prepare(
        "SELECT id, type, unlocked_at, data FROM achievements ORDER BY unlocked_at DESC"
    ).map_err(|e| e.to_string())?;

    let achievements = stmt.query_map([], |row| {
        let data_str: Option<String> = row.get(3)?;
        let data: Option<serde_json::Value> = data_str
            .and_then(|s| serde_json::from_str(&s).ok());

        Ok(Achievement {
            id: row.get(0)?,
            achievement_type: row.get(1)?,
            unlocked_at: row.get(2)?,
            data,
        })
    }).map_err(|e| e.to_string())?;

    achievements.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_achievement(state: State<AppState>, achievement: Achievement) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let data_json = achievement.data
        .map(|d| serde_json::to_string(&d).ok())
        .flatten();

    db.conn.execute(
        "INSERT INTO achievements (id, type, unlocked_at, data) VALUES (?1, ?2, ?3, ?4)",
        (
            &achievement.id,
            &achievement.achievement_type,
            &achievement.unlocked_at,
            &data_json,
        ),
    ).map_err(|e| e.to_string())?;

    Ok(())
}
