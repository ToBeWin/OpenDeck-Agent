import { useTranslation } from "react-i18next";
import { useStore } from "../store";

export function StatusBar() {
  const { t } = useTranslation();
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
            {t("statusbar.slide", { current: currentSlideIndex + 1, total: deck.slides.length })}
          </span>
        ) : (
          <span>{t("statusbar.no_deck")}</span>
        )}
      </div>
      <div className="status-bar-center">
        {loading && <span className="status-loading">{t("statusbar.processing")}</span>}
        {error && <span className="status-error">{error}</span>}
      </div>
      <div className="status-bar-right">
        {deck && (
          <>
            {dirty && <span className="status-dirty">{t("statusbar.unsaved")}</span>}
            {projectPath && <span className="status-project">{t("statusbar.saved")}</span>}
            <span>{deck.theme.name}</span>
          </>
        )}
      </div>
    </div>
  );
}
