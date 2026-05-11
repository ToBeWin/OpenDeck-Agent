import { useStore } from "../store";

export function TopBar() {
  const deck = useStore((s) => s.deck);
  const loading = useStore((s) => s.loading);
  const setDeck = useStore((s) => s.setDeck);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const exportCurrentDeck = useStore((s) => s.exportCurrentDeck);

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
            <button
              className="top-bar-btn top-bar-btn-accent"
              onClick={exportCurrentDeck}
              disabled={loading}
              title="Export as PPTX (Ctrl+E)"
            >
              {loading ? "Exporting..." : "Export PPTX"}
            </button>
            <button className="top-bar-btn" disabled title="Coming soon">
              PDF
            </button>
            <button className="top-bar-btn" disabled title="Coming soon">
              HTML
            </button>
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
