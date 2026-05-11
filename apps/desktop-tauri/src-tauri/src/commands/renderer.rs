use serde::{Deserialize, Serialize};
use std::io::Write;
use std::process::{Command, Stdio};
use tauri::Manager;

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

#[derive(Serialize)]
struct JsonRpcRequest {
    id: String,
    method: String,
    params: serde_json::Value,
}

#[derive(Deserialize)]
struct JsonRpcResponse {
    id: String,
    result: Option<serde_json::Value>,
    error: Option<JsonRpcError>,
}

#[derive(Deserialize)]
struct JsonRpcError {
    code: i32,
    message: String,
}

#[tauri::command]
pub fn generate_test_pptx(app: tauri::AppHandle) -> Result<RenderResult, String> {
    // Resolve paths relative to the app
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

    // Build JSON-RPC request
    let request = JsonRpcRequest {
        id: "gen_001".to_string(),
        method: "render.pptx".to_string(),
        params: serde_json::json!({
            "deckPath": deck_path.to_string_lossy(),
            "outputPath": output_path.to_string_lossy(),
            "mode": "editable"
        }),
    };

    let request_str =
        serde_json::to_string(&request).map_err(|e| format!("Failed to serialize request: {}", e))?;

    // Launch sidecar process
    let mut child = Command::new("node")
        .arg(&sidecar_js)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start sidecar at {}: {}", sidecar_js.display(), e))?;

    // Write request to stdin
    if let Some(ref mut stdin) = child.stdin {
        stdin
            .write_all(request_str.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin
            .write_all(b"\n")
            .map_err(|e| format!("Failed to write newline: {}", e))?;
    }
    // Close stdin to signal EOF
    drop(child.stdin.take());

    // Read stdout
    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for sidecar: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Sidecar exited with error: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let response: JsonRpcResponse = serde_json::from_str(&stdout.trim())
        .map_err(|e| format!("Invalid sidecar response: {} (raw: {})", e, stdout))?;

    if let Some(error) = response.error {
        return Err(format!("Sidecar error {}: {}", error.code, error.message));
    }

    let result = response
        .result
        .ok_or_else(|| "No result in sidecar response".to_string())?;

    let render_result: RenderResult = serde_json::from_value(result)
        .map_err(|e| format!("Failed to parse render result: {}", e))?;

    Ok(render_result)
}
