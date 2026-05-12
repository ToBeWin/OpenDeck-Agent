use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectInfo {
    pub path: String,
    pub name: String,
}

#[tauri::command]
pub async fn save_project(
    app: tauri::AppHandle,
    deck_json: serde_json::Value,
    name: Option<String>,
) -> Result<String, String> {
    let output_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?
        .join("projects");
    fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create projects dir: {}", e))?;

    let project_name = name.unwrap_or_else(|| "untitled".to_string());
    let safe_name = sanitize_filename(&project_name);
    let file_path = output_dir.join(format!("{}.deck.json", safe_name));

    let content = serde_json::to_string_pretty(&deck_json)
        .map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&file_path, &content)
        .map_err(|e| format!("Failed to write project: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn load_project(app: tauri::AppHandle, path: String) -> Result<serde_json::Value, String> {
    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read project: {}", e))?;
    let deck: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse project: {}", e))?;
    Ok(deck)
}

#[tauri::command]
pub async fn list_projects(app: tauri::AppHandle) -> Result<Vec<ProjectInfo>, String> {
    let projects_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?
        .join("projects");
    if !projects_dir.exists() {
        return Ok(vec![]);
    }

    let mut projects = Vec::new();
    let entries = fs::read_dir(&projects_dir)
        .map_err(|e| format!("Failed to read projects dir: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        if path.extension().map(|e| e == "json").unwrap_or(false) {
            if let Some(stem) = path.file_stem() {
                let name = stem.to_string_lossy().to_string();
                // Remove .deck suffix for display
                let display_name = name.strip_suffix(".deck").unwrap_or(&name).to_string();
                projects.push(ProjectInfo {
                    path: path.to_string_lossy().to_string(),
                    name: display_name,
                });
            }
        }
    }

    projects.sort_by(|a, b| b.name.cmp(&a.name));
    Ok(projects)
}

#[tauri::command]
pub async fn delete_project(app: tauri::AppHandle, path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| format!("Failed to delete project: {}", e))?;
    Ok(())
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' { c } else { '_' })
        .collect::<String>()
        .trim()
        .to_string()
}
