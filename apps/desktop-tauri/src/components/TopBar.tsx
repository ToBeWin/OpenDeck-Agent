import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";

interface TopBarProps {
  onPresent?: () => void;
}

export function TopBar({ onPresent }: TopBarProps) {
  const deck = useStore((s) => s.deck);
  const loading = useStore((s) => s.loading);
  const dirty = useStore((s) => s.dirty);
  const setDeck = useStore((s) => s.setDeck);
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
        <span className="top-bar-app-name">OpenDeck Agent</span>
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
              title="Save (Ctrl+S)"
              disabled={loading}
            >
              Save
            </button>
            <button
              className="top-bar-btn"
              onClick={loadProject}
              title="Open (Ctrl+O)"
            >
              Open
            </button>
            <button
              className="top-bar-btn"
              onClick={newProject}
              title="New Deck (Ctrl+N)"
            >
              New Deck
            </button>
            {onPresent && (
              <button
                className="top-bar-btn"
                onClick={onPresent}
                title="Present (Ctrl+P)"
              >
                Present
              </button>
            )}
            <div className="export-dropdown" ref={exportRef}>
              <button
                className="top-bar-btn top-bar-btn-accent"
                onClick={() => setExportOpen(!exportOpen)}
                disabled={loading}
                title="Export"
              >
                {loading ? "Exporting..." : "Export"}
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
                    <span className="export-format">PPTX</span>
                    <span className="export-desc">Editable PowerPoint</span>
                  </button>
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      exportCurrentDeck("pdf");
                      setExportOpen(false);
                    }}
                  >
                    <span className="export-format">PDF</span>
                    <span className="export-desc">Portable Document</span>
                  </button>
                  <button
                    className="export-menu-item"
                    onClick={() => {
                      exportCurrentDeck("html");
                      setExportOpen(false);
                    }}
                  >
                    <span className="export-format">HTML</span>
                    <span className="export-desc">Single-file Web Page</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            className="top-bar-btn"
            onClick={toggleSettings}
            title="Settings (Ctrl+,)"
          >
            &#9881;
          </button>
        )}
        {deck && (
          <button
            className="top-bar-btn"
            onClick={toggleSettings}
            title="Settings (Ctrl+,)"
          >
            &#9881;
          </button>
        )}
      </div>
    </div>
  );
}
