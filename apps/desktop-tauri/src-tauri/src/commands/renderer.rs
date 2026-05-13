use serde::{Deserialize, Serialize};
use tauri::Manager;

use super::jsonrpc;

#[derive(Debug, Serialize, Deserialize)]
pub struct RenderStats {
    pub slide_count: u32,
    pub editable_text_count: u32,
    pub image_count: u32,
    pub chart_count: u32,
    pub table_count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RenderResult {
    pub file_path: String,
    pub warnings: Vec<String>,
    pub stats: RenderStats,
}

#[tauri::command]
pub fn generate_test_pptx(app: tauri::AppHandle) -> Result<RenderResult, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    let sidecar_js = resource_dir
        .join("sidecars")
        .join("node-renderer")
        .join("dist")
        .join("index.js");

    let deck_path = resource_dir
        .join("examples")
        .join("decks")
        .join("sample-deck.json");

    let output_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    std::fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create output dir: {}", e))?;
    let output_path = output_dir.join("output.pptx");

    let request = jsonrpc::JsonRpcRequest::new("render.pptx", serde_json::json!({
        "deckPath": deck_path.to_string_lossy(),
        "outputPath": output_path.to_string_lossy(),
        "mode": "editable"
    }));

    let child = jsonrpc::spawn_sidecar(&sidecar_js)?;
    let (result, _) = jsonrpc::send_request(child, &request)?;

    let render_result: RenderResult = serde_json::from_value(result)
        .map_err(|e| format!("Failed to parse render result: {}", e))?;

    Ok(render_result)
}
