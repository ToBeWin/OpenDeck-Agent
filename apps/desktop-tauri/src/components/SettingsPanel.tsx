import { useState } from "react";
import { useStore } from "../store";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const providerConfig = useStore((s) => s.providerConfig);
  const updateProviderConfig = useStore((s) => s.updateProviderConfig);

  const [local, setLocal] = useState({ ...providerConfig });
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  function handleSave() {
    updateProviderConfig(local);
    onClose();
  }

  function handleCancel() {
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  async function handleTestConnection() {
    setTestStatus("testing");
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("test_connection", { config: local });
      setTestStatus("ok");
    } catch {
      setTestStatus("fail");
    }
  }

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-panel">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={handleCancel}>
            &times;
          </button>
        </div>

        {/* AI Provider Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">AI Provider</h3>
          <div className="settings-field">
            <label className="settings-label">Provider</label>
            <select
              className="settings-select"
              value={local.provider}
              onChange={(e) =>
                setLocal({
                  ...local,
                  provider: e.target.value as "mock" | "ollama" | "openai",
                })
              }
            >
              <option value="mock">Mock</option>
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          {local.provider === "ollama" && (
            <>
              <div className="settings-field">
                <label className="settings-label">Base URL</label>
                <input
                  className="settings-input"
                  type="text"
                  value={local.ollamaBaseUrl}
                  onChange={(e) =>
                    setLocal({ ...local, ollamaBaseUrl: e.target.value })
                  }
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="settings-field">
                <label className="settings-label">Model</label>
                <input
                  className="settings-input"
                  type="text"
                  value={local.ollamaModel}
                  onChange={(e) =>
                    setLocal({ ...local, ollamaModel: e.target.value })
                  }
                  placeholder="llama3"
                />
              </div>
            </>
          )}

          {local.provider === "openai" && (
            <>
              <div className="settings-field">
                <label className="settings-label">API Key</label>
                <input
                  className="settings-input"
                  type="password"
                  value={local.openaiApiKey}
                  onChange={(e) =>
                    setLocal({ ...local, openaiApiKey: e.target.value })
                  }
                  placeholder="sk-..."
                />
              </div>
              <div className="settings-field">
                <label className="settings-label">Base URL</label>
                <input
                  className="settings-input"
                  type="text"
                  value={local.openaiBaseUrl}
                  onChange={(e) =>
                    setLocal({ ...local, openaiBaseUrl: e.target.value })
                  }
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="settings-field">
                <label className="settings-label">Model</label>
                <input
                  className="settings-input"
                  type="text"
                  value={local.openaiModel}
                  onChange={(e) =>
                    setLocal({ ...local, openaiModel: e.target.value })
                  }
                  placeholder="gpt-4o"
                />
              </div>
            </>
          )}

          {local.provider === "mock" && (
            <p className="settings-hint">
              Demo mode — generates sample content
            </p>
          )}

          {local.provider !== "mock" && (
            <button
              className="settings-btn"
              onClick={handleTestConnection}
              disabled={testStatus === "testing"}
            >
              {testStatus === "testing"
                ? "Testing..."
                : testStatus === "ok"
                  ? "Connected ✓"
                  : testStatus === "fail"
                    ? "Failed — Retry"
                    : "Test Connection"}
            </button>
          )}
        </div>

        {/* Language Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Language</h3>
          <div className="settings-radio-group">
            {(["zh", "en", "bilingual"] as const).map((lang) => (
              <label key={lang} className="settings-radio-label">
                <input
                  type="radio"
                  name="language"
                  value={lang}
                  checked={local.language === lang}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      language: e.target.value as "zh" | "en" | "bilingual",
                    })
                  }
                />
                {lang === "zh" ? "中文" : lang === "en" ? "English" : "Bilingual"}
              </label>
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Theme</h3>
          <div className="settings-field">
            <select
              className="settings-select"
              value={local.theme}
              onChange={(e) =>
                setLocal({ ...local, theme: e.target.value })
              }
            >
              <option value="Bloomberg Dark">Bloomberg Dark</option>
              <option value="Apple Keynote">Apple Keynote</option>
              <option value="McKinsey Consulting">McKinsey Consulting</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button className="settings-btn settings-btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="settings-btn settings-btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
