import { useStore } from "../store";
import type { SlideData } from "../types";

function slideTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cover: "Cover",
    agenda: "Agenda",
    insight: "Insight",
    comparison: "Compare",
    timeline: "Timeline",
    data_chart: "Chart",
    closing: "Closing",
  };
  return labels[type] || type;
}

function getSlideTitle(slide: SlideData): string {
  const titleEl = slide.elements.find((el) => el.role === "title");
  return titleEl?.content || slide.mainMessage || `Slide ${slide.index + 1}`;
}

function SlideThumb({
  slide,
  isActive,
}: {
  slide: SlideData;
  isActive: boolean;
}) {
  const setCurrentSlide = useStore((s) => s.setCurrentSlide);
  const title = getSlideTitle(slide);
  const colors = useStore((s) => s.deck?.theme.colors);

  return (
    <div
      className={`slide-thumb ${isActive ? "slide-thumb-active" : ""}`}
      onClick={() => setCurrentSlide(slide.index)}
      style={
        isActive && colors
          ? { borderColor: colors.primary }
          : undefined
      }
    >
      <div className="slide-thumb-preview" style={
        colors ? { background: colors.surface } : undefined
      }>
        <span className="slide-thumb-number">{slide.index + 1}</span>
        <span className="slide-thumb-type">{slideTypeLabel(slide.type)}</span>
      </div>
      <div className="slide-thumb-info">
        <span className="slide-thumb-title">{title}</span>
      </div>
    </div>
  );
}

export function DeckOutline() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);

  if (!deck) return null;

  return (
    <div className="deck-outline">
      <div className="deck-outline-header">
        <span className="deck-outline-label">Slides</span>
        <span className="deck-outline-count">{deck.slides.length}</span>
      </div>
      <div className="deck-outline-list">
        {deck.slides.map((slide) => (
          <SlideThumb
            key={slide.id}
            slide={slide}
            isActive={slide.index === currentSlideIndex}
          />
        ))}
      </div>
    </div>
  );
}
