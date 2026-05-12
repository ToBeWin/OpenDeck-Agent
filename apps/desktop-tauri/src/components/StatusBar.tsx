import { useStore } from "../store";

export function StatusBar() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);
  const loading = useStore((s) => s.loading);
  const error = useStore((s) => s.error);
  const dirty = useStore((s) => s.dirty);
  const projectPath = useStore((s) => s.projectPath);

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {deck ? (
          <span>
            Slide {currentSlideIndex + 1} / {deck.slides.length}
          </span>
        ) : (
          <span>No deck loaded</span>
        )}
      </div>
      <div className="status-bar-center">
        {loading && <span className="status-loading">Processing...</span>}
        {error && <span className="status-error">{error}</span>}
      </div>
      <div className="status-bar-right">
        {deck && (
          <>
            {dirty && <span className="status-dirty">Unsaved</span>}
            {projectPath && <span className="status-project">Saved</span>}
            <span>{deck.theme.name}</span>
          </>
        )}
      </div>
    </div>
  );
}
