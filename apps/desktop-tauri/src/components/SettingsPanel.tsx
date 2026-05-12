import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
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

interface ProviderFieldMap {
  apiKey: string;
  baseUrl: string;
  model: string;
  placeholderApiKey?: string;
  placeholderBaseUrl?: string;
  placeholderModel?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CloudProviderFields({ fields, local, setLocal }: { fields: ProviderFieldMap; local: any; setLocal: any }) {
  return (
    <>
      <div className="settings-field">
        <label className="settings-label">API Key</label>
        <input
          className="settings-input"
          type="password"
          value={local[fields.apiKey] ?? ""}
          onChange={(e) => setLocal({ ...local, [fields.apiKey]: e.target.value })}
          placeholder={fields.placeholderApiKey ?? "sk-..."}
        />
      </div>
      <div className="settings-field">
        <label className="settings-label">Base URL</label>
        <input
          className="settings-input"
          type="text"
          value={local[fields.baseUrl] ?? ""}
          onChange={(e) => setLocal({ ...local, [fields.baseUrl]: e.target.value })}
          placeholder={fields.placeholderBaseUrl ?? "https://api.openai.com/v1"}
        />
      </div>
      <div className="settings-field">
        <label className="settings-label">Model</label>
        <input
          className="settings-input"
          type="text"
          value={local[fields.model] ?? ""}
          onChange={(e) => setLocal({ ...local, [fields.model]: e.target.value })}
          placeholder={fields.placeholderModel ?? "gpt-4o"}
        />
      </div>
    </>
  );
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { t } = useTranslation();
  const providerConfig = useStore((s) => s.providerConfig);
  const updateProviderConfig = useStore((s) => s.updateProviderConfig);
  const setUILanguage = useStore((s) => s.setUILanguage);

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
        setTestMessage(t("settings.connected_ok"));
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
          <h2 className="settings-title">{t("settings.title")}</h2>
          <button className="settings-close" onClick={handleCancel}>
            &times;
          </button>
        </div>

        {/* AI Provider Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">{t("settings.provider")}</h3>
          <div className="settings-field">
            <label className="settings-label">Provider</label>
            <select
              className="settings-select"
              value={local.provider}
              onChange={(e) =>
                setLocal({
                  ...local,
                  provider: e.target.value as typeof local.provider,
                })
              }
            >
              <option value="mock">{t("settings.provider_mock")}</option>
              <option value="ollama">{t("settings.provider_ollama")}</option>
              <option value="openai">{t("settings.provider_openai")}</option>
              <option value="anthropic">{t("settings.provider_anthropic")}</option>
              <option value="gemini">{t("settings.provider_gemini")}</option>
              <option value="deepseek">{t("settings.provider_deepseek")}</option>
              <option value="kimi">{t("settings.provider_kimi")}</option>
              <option value="qwen">{t("settings.provider_qwen")}</option>
              <option value="glm-domestic">{t("settings.provider_glm_domestic")}</option>
              <option value="glm-international">{t("settings.provider_glm_international")}</option>
              <option value="minimax-domestic">{t("settings.provider_minimax_domestic")}</option>
              <option value="minimax-international">{t("settings.provider_minimax_international")}</option>
              <option value="openrouter">{t("settings.provider_openrouter")}</option>
              <option value="lmstudio">{t("settings.provider_lmstudio")}</option>
              <option value="vllm">{t("settings.provider_vllm")}</option>
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
                {t("settings.ollama_hint")} <code>ollama serve</code>
              </p>
            </>
          )}

          {local.provider === "openai" && (
            <CloudProviderFields fields={{
              apiKey: "openaiApiKey", baseUrl: "openaiBaseUrl", model: "openaiModel",
              placeholderBaseUrl: "https://api.openai.com/v1", placeholderModel: "gpt-4o",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "kimi" && (
            <CloudProviderFields fields={{
              apiKey: "kimiApiKey", baseUrl: "kimiBaseUrl", model: "kimiModel",
              placeholderBaseUrl: "https://api.moonshot.cn/v1", placeholderModel: "moonshot-v1-8k",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "glm-domestic" && (
            <CloudProviderFields fields={{
              apiKey: "glmDomesticApiKey", baseUrl: "glmDomesticBaseUrl", model: "glmDomesticModel",
              placeholderBaseUrl: "https://open.bigmodel.cn/api/paas/v4", placeholderModel: "glm-4-plus",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "glm-international" && (
            <CloudProviderFields fields={{
              apiKey: "glmInternationalApiKey", baseUrl: "glmInternationalBaseUrl", model: "glmInternationalModel",
              placeholderBaseUrl: "https://open.bigmodel.cn/api/paas/v4", placeholderModel: "glm-4-plus",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "minimax-domestic" && (
            <CloudProviderFields fields={{
              apiKey: "minimaxDomesticApiKey", baseUrl: "minimaxDomesticBaseUrl", model: "minimaxDomesticModel",
              placeholderBaseUrl: "https://api.minimax.chat/v1", placeholderModel: "MiniMax-Text-01",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "minimax-international" && (
            <CloudProviderFields fields={{
              apiKey: "minimaxInternationalApiKey", baseUrl: "minimaxInternationalBaseUrl", model: "minimaxInternationalModel",
              placeholderBaseUrl: "https://api.minimax.chat/v1", placeholderModel: "MiniMax-Text-01",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "deepseek" && (
            <CloudProviderFields fields={{
              apiKey: "deepseekApiKey", baseUrl: "deepseekBaseUrl", model: "deepseekModel",
              placeholderBaseUrl: "https://api.deepseek.com/v1", placeholderModel: "deepseek-chat",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "qwen" && (
            <CloudProviderFields fields={{
              apiKey: "qwenApiKey", baseUrl: "qwenBaseUrl", model: "qwenModel",
              placeholderBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", placeholderModel: "qwen-plus",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "openrouter" && (
            <CloudProviderFields fields={{
              apiKey: "openrouterApiKey", baseUrl: "openrouterBaseUrl", model: "openrouterModel",
              placeholderBaseUrl: "https://openrouter.ai/api/v1", placeholderModel: "openai/gpt-4o-mini",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "lmstudio" && (
            <CloudProviderFields fields={{
              apiKey: "lmstudioApiKey", baseUrl: "lmstudioBaseUrl", model: "lmstudioModel",
              placeholderApiKey: "", placeholderBaseUrl: "http://localhost:1234/v1", placeholderModel: "local-model",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "vllm" && (
            <CloudProviderFields fields={{
              apiKey: "vllmApiKey", baseUrl: "vllmBaseUrl", model: "vllmModel",
              placeholderApiKey: "", placeholderBaseUrl: "http://localhost:8000/v1", placeholderModel: "meta-llama/Meta-Llama-3-8B-Instruct",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "anthropic" && (
            <CloudProviderFields fields={{
              apiKey: "anthropicApiKey", baseUrl: "anthropicBaseUrl", model: "anthropicModel",
              placeholderBaseUrl: "https://api.anthropic.com/v1", placeholderModel: "claude-3-5-sonnet-20241022",
            }} local={local} setLocal={setLocal} />
          )}
          {local.provider === "gemini" && (
            <CloudProviderFields fields={{
              apiKey: "geminiApiKey", baseUrl: "geminiBaseUrl", model: "geminiModel",
              placeholderBaseUrl: "https://generativelanguage.googleapis.com/v1beta", placeholderModel: "gemini-1.5-flash",
            }} local={local} setLocal={setLocal} />
          )}

          {local.provider === "mock" && (
            <p className="settings-hint">{t("settings.demo_mode")}</p>
          )}

          {local.provider !== "mock" && (
            <div className="settings-test-row">
              <button
                className="settings-btn"
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
              >
                {testStatus === "testing"
                  ? t("settings.testing")
                  : testStatus === "ok"
                    ? t("settings.connected")
                    : testStatus === "fail"
                      ? t("settings.retry")
                      : t("settings.test_connection")}
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

        {/* Content Language Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">{t("settings.language")} (Content)</h3>
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
                {lang === "zh" ? t("settings.lang_zh") : lang === "en" ? t("settings.lang_en") : t("settings.lang_bilingual")}
              </label>
            ))}
          </div>
        </div>

        {/* UI Language Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">{t("settings.language")} (UI)</h3>
          <div className="settings-radio-group">
            {(["zh", "en"] as const).map((lang) => (
              <label key={lang} className="settings-radio-label">
                <input
                  type="radio"
                  name="uilanguage"
                  value={lang}
                  checked={local.uilanguage === lang}
                  onChange={(e) => {
                    const val = e.target.value as "zh" | "en";
                    setLocal({ ...local, uilanguage: val });
                    setUILanguage(val);
                  }}
                />
                {lang === "zh" ? t("settings.lang_zh") : t("settings.lang_en")}
              </label>
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">{t("settings.theme")}</h3>
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
            {t("settings.cancel")}
          </button>
          <button className="settings-btn settings-btn-primary" onClick={handleSave}>
            {t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
