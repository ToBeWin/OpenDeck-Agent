mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
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
