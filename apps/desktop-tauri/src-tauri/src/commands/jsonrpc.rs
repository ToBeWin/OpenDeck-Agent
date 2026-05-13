use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};

#[derive(Serialize)]
pub struct JsonRpcRequest {
    pub id: String,
    pub method: String,
    pub params: serde_json::Value,
}

#[derive(Deserialize)]
pub struct JsonRpcResponse {
    pub id: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<JsonRpcError>,
}

#[derive(Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
}

impl JsonRpcRequest {
    pub fn new(method: &str, params: serde_json::Value) -> Self {
        Self {
            id: format!("req_{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis()),
            method: method.to_string(),
            params,
        }
    }
}

pub fn spawn_sidecar(sidecar_js: &std::path::Path) -> Result<Child, String> {
    Command::new("node")
        .arg(sidecar_js)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start sidecar at {}: {}", sidecar_js.display(), e))
}

pub fn send_request(mut child: Child, request: &JsonRpcRequest) -> Result<(serde_json::Value, Option<Child>), String> {
    let request_str = serde_json::to_string(request)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    if let Some(ref mut stdin) = child.stdin {
        stdin.write_all(request_str.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin.write_all(b"\n")
            .map_err(|e| format!("Failed to write newline: {}", e))?;
    }
    // Close stdin to signal end of requests, then wait
    drop(child.stdin.take());

    let output = child.wait_with_output()
        .map_err(|e| format!("Failed to wait for sidecar: {}", e))?;

    // Reconstruct process — sidecar exited after stdin close (single-request mode)
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Sidecar exited with error: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let response: JsonRpcResponse = serde_json::from_str(stdout.trim())
        .map_err(|e| format!("Invalid response: {} (raw: {})", e, stdout))?;

    if let Some(error) = response.error {
        return Err(format!("Sidecar error {}: {}", error.code, error.message));
    }

    response.result
        .ok_or_else(|| "No result in sidecar response".to_string())
        .map(|v| (v, None))  // Process exited, return None
}

/// Send a request without closing stdin (keepalive mode).
/// Reads progress JSON lines from stderr and calls the progress callback.
/// Returns the response and the child for reuse.
pub fn send_request_keepalive<F>(
    mut child: Child,
    request: &JsonRpcRequest,
    on_progress: F,
) -> Result<(serde_json::Value, Child), String>
where
    F: Fn(&str, &str) + Send + 'static,
{
    let request_str = serde_json::to_string(request)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    // Write request to stdin
    if let Some(ref mut stdin) = child.stdin {
        stdin.write_all(request_str.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin.write_all(b"\n")
            .map_err(|e| format!("Failed to write newline: {}", e))?;
    }

    // Read stderr for progress in a separate thread
    let stderr = child.stderr.take()
        .ok_or_else(|| "No stderr".to_string())?;

    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                if let Ok(msg) = serde_json::from_str::<serde_json::Value>(&line) {
                    if msg.get("type").and_then(|v| v.as_str()) == Some("progress") {
                        let step = msg.get("step").and_then(|v| v.as_str()).unwrap_or("");
                        let detail = msg.get("detail").and_then(|v| v.as_str()).unwrap_or("");
                        on_progress(step, detail);
                    }
                }
            }
        }
    });

    // Read response from stdout (keepalive: do NOT close stdin, process stays alive)
    let stdout = child.stdout.take()
        .ok_or_else(|| "No stdout".to_string())?;
    let mut reader = BufReader::new(stdout);
    let mut response_line = String::new();
    reader.read_line(&mut response_line)
        .map_err(|e| format!("Failed to read stdout: {}", e))?;

    let response: JsonRpcResponse = serde_json::from_str(response_line.trim())
        .map_err(|e| format!("Invalid response: {} (raw: {})", e, response_line))?;

    if let Some(error) = response.error {
        return Err(format!("Sidecar error {}: {}", error.code, error.message));
    }

    let result = response.result
        .ok_or_else(|| "No result in sidecar response".to_string())?;

    Ok((result, child))
}
