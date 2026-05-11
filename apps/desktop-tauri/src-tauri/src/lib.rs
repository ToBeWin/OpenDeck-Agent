mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::renderer::generate_test_pptx,
            commands::agent::generate_deck,
            commands::agent::modify_deck,
            commands::agent::export_pptx,
            commands::agent::export_pdf,
            commands::agent::check_provider,
            commands::agent::list_providers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
