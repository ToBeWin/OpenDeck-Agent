use serde::{Deserialize, Serialize};
use std::process::Child;
use tauri::Manager;

use super::jsonrpc::{self, JsonRpcRequest};

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

pub struct AgentSidecarState {
    pub process: Option<Child>,
    pub sidecar_path: std::path::PathBuf,
}

fn call_agent_sidecar(
    app: &tauri::AppHandle,
    method: &str,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let state_lock = app.state::<std::sync::Mutex<AgentSidecarState>>();
    let mut guard = state_lock.lock().map_err(|e| format!("Lock error: {}", e))?;

    // Start sidecar if not running
    if guard.process.is_none() {
        let child = jsonrpc::spawn_sidecar(&guard.sidecar_path)?;
        guard.process = Some(child);
    }

    // Take the process
    if let Some(child) = guard.process.take() {
        let request = JsonRpcRequest::new(method, params);
        match jsonrpc::send_request(child, &request) {
            Ok((result, maybe_child)) => {
                // Keep process alive for future requests
                guard.process = maybe_child;
                Ok(result)
            }
            Err(e) => Err(e),
        }
    } else {
        Err("Sidecar not started".to_string())
    }
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

    let request = jsonrpc::JsonRpcRequest::new(method, serde_json::json!({
        "deckPath": deck_path.to_string_lossy(),
        "outputPath": output_path.to_string_lossy(),
    }));

    let child = jsonrpc::spawn_sidecar(&sidecar_js)?;
    let (mut result, _) = jsonrpc::send_request(child, &request)?;
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
pub fn generate_image(
    app: tauri::AppHandle,
    prompt: String,
    image_provider: Option<String>,
    api_key: Option<String>,
    model: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
    style: Option<String>,
) -> Result<serde_json::Value, String> {
    let mut params = serde_json::json!({
        "prompt": prompt,
    });
    if let Some(p) = image_provider { params["imageProvider"] = serde_json::json!(p); }
    if let Some(k) = api_key { params["apiKey"] = serde_json::json!(k); }
    if let Some(m) = model { params["model"] = serde_json::json!(m); }
    if let Some(w) = width { params["width"] = serde_json::json!(w); }
    if let Some(h) = height { params["height"] = serde_json::json!(h); }
    if let Some(s) = style { params["style"] = serde_json::json!(s); }

    call_agent_sidecar(&app, "agent.generateImage", params)
}

#[tauri::command]
pub fn list_providers(app: tauri::AppHandle) -> Result<ProviderList, String> {
    let result = call_agent_sidecar(&app, "agent.listProviders", serde_json::json!({}))?;
    let list: ProviderList =
        serde_json::from_value(result).map_err(|e| format!("Failed to parse list: {}", e))?;
    Ok(list)
}
