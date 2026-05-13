mod commands;

use commands::agent::AgentSidecarState;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

fn resolve_sidecar_path(app: &tauri::AppHandle) -> PathBuf {
    let resource_dir = app
        .path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    resource_dir
        .join("sidecars")
        .join("agent-sidecar")
        .join("dist")
        .join("index.js")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let sidecar_path = resolve_sidecar_path(app.handle());
            app.manage(Mutex::new(AgentSidecarState {
                process: None,
                sidecar_path,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::renderer::generate_test_pptx,
            commands::agent::generate_deck,
            commands::agent::modify_deck,
            commands::agent::export_pptx,
            commands::agent::export_pdf,
            commands::agent::export_html,
            commands::agent::check_provider,
            commands::agent::list_providers,
            commands::project::save_project,
            commands::project::load_project,
            commands::project::list_projects,
            commands::project::delete_project,
            commands::agent::generate_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
