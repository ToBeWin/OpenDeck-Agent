import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store";

interface TopBarProps {
  onPresent?: () => void;
}

export function TopBar({ onPresent }: TopBarProps) {
  const { t } = useTranslation();
  const deck = useStore((s) => s.deck);
  const loading = useStore((s) => s.loading);
  const dirty = useStore((s) => s.dirty);

  const toggleSettings = useStore((s) => s.toggleSettings);
  const exportCurrentDeck = useStore((s) => s.exportCurrentDeck);
  const saveProject = useStore((s) => s.saveProject);
  const loadProject = useStore((s) => s.loadProject);
  const newProject = useStore((s) => s.newProject);

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [exportOpen]);

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span className="top-bar-logo">OD</span>
        <span className="top-bar-app-name">{t("app.name")}</span>
      </div>
      <div className="top-bar-center">
        {deck && <span className="top-bar-title">{deck.title}</span>}
      </div>
      <div className="top-bar-right">
        {deck ? (
          <>
            <span className="top-bar-theme">{deck.theme.name}</span>
            <span className="top-bar-dirty">{dirty ? "●" : ""}</span>
            <button
              className="top-bar-btn"
              onClick={saveProject}
              title={t("topbar.tooltip_save")}
              disabled={loading}
            >
              {t("topbar.save")}
            </button>
            <button
              className="top-bar-btn"
              onClick={loadProject}
              title={t("topbar.tooltip_open")}
            >
              {t("topbar.open")}
            </button>
            <button
              className="top-bar-btn"
              onClick={newProject}
              title={t("topbar.tooltip_new")}
            >
              {t("topbar.new")}
            </button>
            {onPresent && (
              <button
                className="top-bar-btn"
                onClick={onPresent}
                title={t("topbar.tooltip_present")}
              >
                {t("topbar.present")}
              </button>
            )}
            <div className="export-dropdown" ref={exportRef}>
              <button
                className="top-bar-btn top-bar-btn-accent"
                onClick={() => setExportOpen(!exportOpen)}
                disabled={loading}
                title={t("topbar.export")}
              >
                {loading ? t("topbar.exporting") : t("topbar.export")}
              </button>
              {exportOpen && (
                <div className="export-menu">
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      exportCurrentDeck("pptx");
                      setExportOpen(false);
                    }}
                  >
                    <span className="export-format">{t("topbar.export_pptx")}</span>
                    <span className="export-desc">{t("topbar.export_pptx_desc")}</span>
                  </button>
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      exportCurrentDeck("pdf");
                      setExportOpen(false);
                    }}
                  >
                    <span className="export-format">{t("topbar.export_pdf")}</span>
                    <span className="export-desc">{t("topbar.export_pdf_desc")}</span>
                  </button>
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      exportCurrentDeck("html");
                      setExportOpen(false);
                    }}
                  >
                    <span className="export-format">{t("topbar.export_html")}</span>
                    <span className="export-desc">{t("topbar.export_html_desc")}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            className="top-bar-btn"
            onClick={toggleSettings}
            title={t("topbar.tooltip_settings")}
          >
            &#9881;
          </button>
        )}
        {deck && (
          <button
            className="top-bar-btn"
            onClick={toggleSettings}
            title={t("topbar.tooltip_settings")}
          >
            &#9881;
          </button>
        )}
      </div>
    </div>
  );
}
