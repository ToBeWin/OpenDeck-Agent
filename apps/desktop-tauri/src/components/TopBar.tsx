import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";

export function TopBar() {
  const deck = useStore((s) => s.deck);
  const loading = useStore((s) => s.loading);
  const setDeck = useStore((s) => s.setDeck);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const exportCurrentDeck = useStore((s) => s.exportCurrentDeck);

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
            <button
              className="top-bar-btn"
              onClick={() => setDeck(null)}
              title="New Deck (Ctrl+N)"
            >
              New Deck
            </button>
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
