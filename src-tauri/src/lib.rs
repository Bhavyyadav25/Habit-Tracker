mod db;
mod commands;

use tauri::{Manager, WindowEvent};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::menu::{Menu, MenuItem};
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<db::Database>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize database
            let db = db::Database::new().expect("Failed to initialize database");
            app.manage(AppState { db: Mutex::new(db) });

            // Setup system tray
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("HabitFlow")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Hide window instead of closing
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::habits::get_habits,
            commands::habits::add_habit,
            commands::habits::update_habit,
            commands::habits::delete_habit,
            commands::habits::get_completions,
            commands::habits::add_completion,
            commands::habits::delete_completion,
            commands::mood::get_mood_entries,
            commands::mood::add_mood_entry,
            commands::mood::update_mood_entry,
            commands::mood::delete_mood_entry,
            commands::pomodoro::get_pomodoro_sessions,
            commands::pomodoro::add_pomodoro_session,
            commands::achievements::get_achievements,
            commands::achievements::add_achievement,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
