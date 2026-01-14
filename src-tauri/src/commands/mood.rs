use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct MoodEntry {
    pub id: String,
    #[serde(rename = "moodLevel")]
    pub mood_level: i32,
    pub emoji: String,
    pub journal: Option<String>,
    pub tags: Vec<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[tauri::command]
pub fn get_mood_entries(state: State<AppState>) -> Result<Vec<MoodEntry>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db.conn.prepare(
        "SELECT id, mood_level, emoji, journal, tags, created_at FROM mood_entries ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;

    let entries = stmt.query_map([], |row| {
        let tags_str: Option<String> = row.get(4)?;
        let tags: Vec<String> = tags_str
            .map(|s| serde_json::from_str(&s).unwrap_or_default())
            .unwrap_or_default();

        Ok(MoodEntry {
            id: row.get(0)?,
            mood_level: row.get(1)?,
            emoji: row.get(2)?,
            journal: row.get(3)?,
            tags,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    entries.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_mood_entry(state: State<AppState>, entry: MoodEntry) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let tags_json = serde_json::to_string(&entry.tags).map_err(|e| e.to_string())?;

    db.conn.execute(
        "INSERT INTO mood_entries (id, mood_level, emoji, journal, tags, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (
            &entry.id,
            entry.mood_level,
            &entry.emoji,
            &entry.journal,
            &tags_json,
            &entry.created_at,
        ),
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_mood_entry(state: State<AppState>, id: String, updates: serde_json::Value) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut set_clauses = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(mood_level) = updates.get("moodLevel").and_then(|v| v.as_i64()) {
        set_clauses.push("mood_level = ?");
        params.push(Box::new(mood_level as i32));
    }
    if let Some(emoji) = updates.get("emoji").and_then(|v| v.as_str()) {
        set_clauses.push("emoji = ?");
        params.push(Box::new(emoji.to_string()));
    }
    if let Some(journal) = updates.get("journal").and_then(|v| v.as_str()) {
        set_clauses.push("journal = ?");
        params.push(Box::new(journal.to_string()));
    }
    if let Some(tags) = updates.get("tags") {
        set_clauses.push("tags = ?");
        params.push(Box::new(serde_json::to_string(tags).unwrap_or_default()));
    }

    if set_clauses.is_empty() {
        return Ok(());
    }

    params.push(Box::new(id));
    let sql = format!("UPDATE mood_entries SET {} WHERE id = ?", set_clauses.join(", "));

    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    db.conn.execute(&sql, params_refs.as_slice()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_mood_entry(state: State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.conn.execute("DELETE FROM mood_entries WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
