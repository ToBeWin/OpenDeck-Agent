import { useStore } from "../store";

export function TopBar() {
  const deck = useStore((s) => s.deck);
  const loading = useStore((s) => s.loading);
  const loadSampleDeck = useStore((s) => s.loadSampleDeck);
  const generatePptx = useStore((s) => s.generatePptx);

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
        {!deck && (
          <button className="top-bar-btn" onClick={loadSampleDeck}>
            Load Sample Deck
          </button>
        )}
        {deck && (
          <>
            <span className="top-bar-theme">{deck.theme.name}</span>
            <button
              className="top-bar-btn top-bar-btn-accent"
              onClick={generatePptx}
              disabled={loading}
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
        )}
      </div>
    </div>
  );
}
