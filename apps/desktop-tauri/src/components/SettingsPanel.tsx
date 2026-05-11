import { useState, useEffect, useCallback } from "react";
import { useStore } from "../store";

interface SettingsPanelProps {
  onClose: () => void;
}

const THEMES = [
  "Bloomberg Dark",
  "Apple Keynote",
  "McKinsey Consulting",
  "Dark Elegance",
  "Minimal Light",
  "Tech Gradient",
];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const providerConfig = useStore((s) => s.providerConfig);
  const updateProviderConfig = useStore((s) => s.updateProviderConfig);

  const [local, setLocal] = useState({ ...providerConfig });
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [detectingModels, setDetectingModels] = useState(false);

  const detectOllama = useCallback(async () => {
    setDetectingModels(true);
    try {
      const { checkProvider } = await import("../lib/tauri");
      const status = await checkProvider("ollama");
      if (status.available) {
        // Try to get model list from the sidecar
        const { listProviders } = await import("../lib/tauri");
        const list = await listProviders();
        // Filter for ollama-related providers
        const models = list.providers
          .filter((p: string) => p.startsWith("ollama-"))
          .map((p: string) => p.replace("ollama-", ""));
        if (models.length > 0) {
          setOllamaModels(models);
          if (!local.ollamaModel || local.ollamaModel === "llama3") {
            setLocal((prev) => ({ ...prev, ollamaModel: models[0] }));
          }
        }
      }
    } catch {
      // Ollama not available
    } finally {
      setDetectingModels(false);
    }
  }, [local.ollamaModel]);

  useEffect(() => {
    if (local.provider === "ollama") {
      detectOllama();
    }
  }, [local.provider, detectOllama]);

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
    setTestMessage("");
    try {
      const { checkProvider } = await import("../lib/tauri");
      const status = await checkProvider(local.provider);
      if (status.available) {
        setTestStatus("ok");
        setTestMessage("Connected successfully");
      } else {
        setTestStatus("fail");
        setTestMessage(status.reason || "Provider not available");
      }
    } catch (e) {
      setTestStatus("fail");
      setTestMessage(String(e));
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
              <option value="mock">Mock (Demo)</option>
              <option value="ollama">Ollama (Local)</option>
              <option value="openai">OpenAI Compatible</option>
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
                <label className="settings-label">
                  Model
                  {detectingModels && (
                    <span className="settings-detecting"> detecting...</span>
                  )}
                </label>
                {ollamaModels.length > 0 ? (
                  <select
                    className="settings-select"
                    value={local.ollamaModel}
                    onChange={(e) =>
                      setLocal({ ...local, ollamaModel: e.target.value })
                    }
                  >
                    {ollamaModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="settings-input"
                    type="text"
                    value={local.ollamaModel}
                    onChange={(e) =>
                      setLocal({ ...local, ollamaModel: e.target.value })
                    }
                    placeholder="llama3"
                  />
                )}
              </div>
              <p className="settings-hint">
                Make sure Ollama is running: <code>ollama serve</code>
              </p>
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
              Demo mode — generates sample content without a real AI model
            </p>
          )}

          {local.provider !== "mock" && (
            <div className="settings-test-row">
              <button
                className="settings-btn"
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
              >
                {testStatus === "testing"
                  ? "Testing..."
                  : testStatus === "ok"
                    ? "Connected"
                    : testStatus === "fail"
                      ? "Retry"
                      : "Test Connection"}
              </button>
              {testMessage && (
                <span
                  className={`settings-test-message ${testStatus === "ok" ? "test-ok" : testStatus === "fail" ? "test-fail" : ""}`}
                >
                  {testMessage}
                </span>
              )}
            </div>
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
          <div className="settings-theme-grid">
            {THEMES.map((theme) => (
              <button
                key={theme}
                className={`settings-theme-card ${local.theme === theme ? "theme-active" : ""}`}
                onClick={() => setLocal({ ...local, theme })}
              >
                <div
                  className="theme-preview-swatch"
                  data-theme={theme.toLowerCase().replace(/\s+/g, "_")}
                />
                <span className="theme-card-name">{theme}</span>
              </button>
            ))}
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
