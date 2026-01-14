use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct Habit {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub icon: String,
    pub color: String,
    pub frequency: String,
    #[serde(rename = "targetCount")]
    pub target_count: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub archived: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HabitCompletion {
    pub id: String,
    #[serde(rename = "habitId")]
    pub habit_id: String,
    #[serde(rename = "completedAt")]
    pub completed_at: String,
    pub count: i32,
    pub notes: Option<String>,
}

#[tauri::command]
pub fn get_habits(state: State<AppState>) -> Result<Vec<Habit>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db.conn.prepare(
        "SELECT id, name, description, icon, color, frequency, target_count, created_at, archived
         FROM habits ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;

    let habits = stmt.query_map([], |row| {
        Ok(Habit {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            icon: row.get(3)?,
            color: row.get(4)?,
            frequency: row.get(5)?,
            target_count: row.get(6)?,
            created_at: row.get(7)?,
            archived: row.get::<_, i32>(8)? != 0,
        })
    }).map_err(|e| e.to_string())?;

    habits.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_habit(state: State<AppState>, habit: Habit) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.conn.execute(
        "INSERT INTO habits (id, name, description, icon, color, frequency, target_count, created_at, archived)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &habit.id,
            &habit.name,
            &habit.description,
            &habit.icon,
            &habit.color,
            &habit.frequency,
            habit.target_count,
            &habit.created_at,
            if habit.archived { 1 } else { 0 },
        ),
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_habit(state: State<AppState>, id: String, updates: serde_json::Value) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    // Build dynamic update query
    let mut set_clauses = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(name) = updates.get("name").and_then(|v| v.as_str()) {
        set_clauses.push("name = ?");
        params.push(Box::new(name.to_string()));
    }
    if let Some(description) = updates.get("description").and_then(|v| v.as_str()) {
        set_clauses.push("description = ?");
        params.push(Box::new(description.to_string()));
    }
    if let Some(icon) = updates.get("icon").and_then(|v| v.as_str()) {
        set_clauses.push("icon = ?");
        params.push(Box::new(icon.to_string()));
    }
    if let Some(color) = updates.get("color").and_then(|v| v.as_str()) {
        set_clauses.push("color = ?");
        params.push(Box::new(color.to_string()));
    }
    if let Some(archived) = updates.get("archived").and_then(|v| v.as_bool()) {
        set_clauses.push("archived = ?");
        params.push(Box::new(if archived { 1 } else { 0 }));
    }

    if set_clauses.is_empty() {
        return Ok(());
    }

    params.push(Box::new(id));
    let sql = format!("UPDATE habits SET {} WHERE id = ?", set_clauses.join(", "));

    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    db.conn.execute(&sql, params_refs.as_slice()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_habit(state: State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.conn.execute("DELETE FROM habits WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_completions(state: State<AppState>) -> Result<Vec<HabitCompletion>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db.conn.prepare(
        "SELECT id, habit_id, completed_at, count, notes FROM habit_completions ORDER BY completed_at DESC"
    ).map_err(|e| e.to_string())?;

    let completions = stmt.query_map([], |row| {
        Ok(HabitCompletion {
            id: row.get(0)?,
            habit_id: row.get(1)?,
            completed_at: row.get(2)?,
            count: row.get(3)?,
            notes: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    completions.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_completion(state: State<AppState>, completion: HabitCompletion) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.conn.execute(
        "INSERT INTO habit_completions (id, habit_id, completed_at, count, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        (
            &completion.id,
            &completion.habit_id,
            &completion.completed_at,
            completion.count,
            &completion.notes,
        ),
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_completion(state: State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.conn.execute("DELETE FROM habit_completions WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
