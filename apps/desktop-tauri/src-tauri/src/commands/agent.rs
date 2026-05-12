use serde::{Deserialize, Serialize};
use std::io::Write;
use std::process::{Command, Stdio};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateOptions {
    pub provider: Option<String>,
    pub purpose: Option<String>,
    pub audience: Option<String>,
    pub language: Option<String>,
    pub slide_count: Option<u32>,
    pub theme: Option<String>,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderStatus {
    pub available: bool,
    pub reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderList {
    pub providers: Vec<String>,
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

fn call_sidecar(
    sidecar_path: &std::path::Path,
    request: &JsonRpcRequest,
) -> Result<serde_json::Value, String> {
    let request_str =
        serde_json::to_string(request).map_err(|e| format!("Failed to serialize: {}", e))?;

    let mut child = Command::new("node")
        .arg(sidecar_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start sidecar at {}: {}", sidecar_path.display(), e))?;

    if let Some(ref mut stdin) = child.stdin {
        stdin.write_all(request_str.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin.write_all(b"\n")
            .map_err(|e| format!("Failed to write newline: {}", e))?;
    }
    drop(child.stdin.take());

    let output = child.wait_with_output()
        .map_err(|e| format!("Failed to wait for sidecar: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Sidecar exited with error: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let response: JsonRpcResponse = serde_json::from_str(stdout.trim())
        .map_err(|e| format!("Invalid sidecar response: {} (raw: {})", e, stdout))?;

    if let Some(error) = response.error {
        return Err(format!("Sidecar error {}: {}", error.code, error.message));
    }

    response.result.ok_or_else(|| "No result in sidecar response".to_string())
}

fn new_request_id() -> String {
    format!("req_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis())
}

fn call_agent_sidecar(
    app: &tauri::AppHandle,
    method: &str,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    let sidecar_js = resource_dir
        .join("sidecars")
        .join("agent-sidecar")
        .join("dist")
        .join("index.js");

    let request = JsonRpcRequest {
        id: new_request_id(),
        method: method.to_string(),
        params,
    };

    call_sidecar(&sidecar_js, &request)
}

#[tauri::command]
pub fn generate_deck(
    app: tauri::AppHandle,
    prompt: String,
    options: Option<GenerateOptions>,
) -> Result<serde_json::Value, String> {
    let mut params = serde_json::json!({ "prompt": prompt });

    if let Some(opts) = options {
        if let Some(p) = opts.provider {
            params["provider"] = serde_json::json!(p);
        }
        if let Some(p) = opts.purpose {
            params["purpose"] = serde_json::json!(p);
        }
        if let Some(a) = opts.audience {
            params["audience"] = serde_json::json!(a);
        }
        if let Some(l) = opts.language {
            params["language"] = serde_json::json!(l);
        }
        if let Some(s) = opts.slide_count {
            params["slideCount"] = serde_json::json!(s);
        }
        if let Some(t) = opts.theme {
            params["theme"] = serde_json::json!(t);
        }
        if let Some(k) = opts.api_key {
            params["apiKey"] = serde_json::json!(k);
        }
        if let Some(u) = opts.base_url {
            params["baseUrl"] = serde_json::json!(u);
        }
        if let Some(m) = opts.model {
            params["model"] = serde_json::json!(m);
        }
    }

    call_agent_sidecar(&app, "agent.generate", params)
}

#[tauri::command]
pub fn modify_deck(
    app: tauri::AppHandle,
    deck_json: serde_json::Value,
    command: String,
) -> Result<serde_json::Value, String> {
    let params = serde_json::json!({
        "deck": deck_json,
        "command": command,
    });

    call_agent_sidecar(&app, "agent.modify", params)
}

fn render_export(
    app: &tauri::AppHandle,
    deck_json: &serde_json::Value,
    method: &str,
    extension: &str,
) -> Result<serde_json::Value, String> {
    let output_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    std::fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create output dir: {}", e))?;

    let deck_path = output_dir.join("current-deck.json");
    let output_path = output_dir.join(format!("output.{}", extension));

    let deck_str = serde_json::to_string_pretty(deck_json)
        .map_err(|e| format!("Failed to serialize deck: {}", e))?;
    std::fs::write(&deck_path, deck_str)
        .map_err(|e| format!("Failed to write deck file: {}", e))?;

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    let sidecar_js = resource_dir
        .join("sidecars")
        .join("node-renderer")
        .join("dist")
        .join("index.js");

    let request = JsonRpcRequest {
        id: new_request_id(),
        method: method.to_string(),
        params: serde_json::json!({
            "deckPath": deck_path.to_string_lossy(),
            "outputPath": output_path.to_string_lossy(),
        }),
    };

    let mut result = call_sidecar(&sidecar_js, &request)?;
    result["outputPath"] = serde_json::json!(output_path.to_string_lossy());
    Ok(result)
}

#[tauri::command]
pub fn export_pptx(
    app: tauri::AppHandle,
    deck_json: serde_json::Value,
) -> Result<serde_json::Value, String> {
    render_export(&app, &deck_json, "render.pptx", "pptx")
}

#[tauri::command]
pub fn export_pdf(
    app: tauri::AppHandle,
    deck_json: serde_json::Value,
) -> Result<serde_json::Value, String> {
    render_export(&app, &deck_json, "render.pdf", "pdf")
}

#[tauri::command]
pub fn export_html(
    app: tauri::AppHandle,
    deck_json: serde_json::Value,
) -> Result<serde_json::Value, String> {
    render_export(&app, &deck_json, "render.html", "html")
}

#[tauri::command]
pub fn check_provider(
    app: tauri::AppHandle,
    name: String,
) -> Result<ProviderStatus, String> {
    let params = serde_json::json!({ "name": name });
    let result = call_agent_sidecar(&app, "agent.checkProvider", params)?;
    let status: ProviderStatus =
        serde_json::from_value(result).map_err(|e| format!("Failed to parse status: {}", e))?;
    Ok(status)
}

#[tauri::command]
pub fn list_providers(app: tauri::AppHandle) -> Result<ProviderList, String> {
    let result = call_agent_sidecar(&app, "agent.listProviders", serde_json::json!({}))?;
    let list: ProviderList =
        serde_json::from_value(result).map_err(|e| format!("Failed to parse list: {}", e))?;
    Ok(list)
}
