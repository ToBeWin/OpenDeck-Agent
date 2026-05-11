import { useStore } from "../store";
import type { SlideData, ElementData, DeckTheme } from "../types";

function BarChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  const max = Math.max(...values, 1);

  return (
    <div className="chart-bar">
      {values.map((v, i) => (
        <div key={i} className="chart-bar-col">
          <div className="chart-bar-value">{v}</div>
          <div
            className="chart-bar-rect"
            style={{
              height: `${(v / max) * 100}%`,
              background: colors.chartColors[i % colors.chartColors.length],
            }}
          />
          <div className="chart-bar-label">{categories[i]}</div>
        </div>
      ))}
    </div>
  );
}

function TableElement({ data }: { data: ElementData }) {
  if (!data.headers || !data.rows) return null;

  return (
    <div className="slide-table-wrap">
      <table className="slide-table">
        <thead>
          <tr>
            {data.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SlideElement({
  el,
  theme,
  layout,
}: {
  el: ElementData;
  theme: DeckTheme;
  layout: string;
}) {
  const { colors, typography } = theme;

  if (el.type === "table") {
    return <TableElement data={el} />;
  }

  if (el.type === "chart") {
    return <BarChart data={el} colors={colors} />;
  }

  const text = el.content || "";
  const lines = text.split("\n").filter(Boolean);

  if (el.role === "title") {
    return (
      <h2
        className="slide-title"
        style={{
          fontFamily: typography.titleFont,
          fontSize: `${typography.titleSize / 2}px`,
          fontWeight: typography.titleWeight,
          color: colors.textPrimary,
        }}
      >
        {text}
      </h2>
    );
  }

  if (el.role === "subtitle") {
    return (
      <p
        className="slide-subtitle"
        style={{
          fontSize: `${typography.subtitleSize / 2}px`,
          color: colors.textSecondary,
        }}
      >
        {text}
      </p>
    );
  }

  if (el.role === "metric") {
    return (
      <div
        className="slide-metric"
        style={{
          color: colors.accent,
          fontSize: `${typography.titleSize}px`,
        }}
      >
        {text}
      </div>
    );
  }

  if (el.role === "label") {
    return (
      <p
        className="slide-label"
        style={{
          fontSize: `${typography.captionSize}px`,
          color: colors.textSecondary,
        }}
      >
        {text}
      </p>
    );
  }

  if (layout === "two_column" && el.role === "body") {
    return (
      <div className="slide-body-col">
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: `${typography.bodySize / 1.5}px`,
              lineHeight: typography.lineHeight,
              color: i === 0 ? colors.primary : colors.textPrimary,
              fontWeight: i === 0 ? 600 : 400,
              marginBottom: i === 0 ? "8px" : "4px",
            }}
          >
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="slide-body">
      {lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontSize: `${typography.bodySize / 1.5}px`,
            lineHeight: typography.lineHeight,
            color: colors.textPrimary,
            marginBottom: "4px",
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function renderSlideLayout(slide: SlideData, theme: DeckTheme) {
  const { layout, elements } = slide;

  if (layout === "hero_title") {
    const title = elements.find((el) => el.role === "title");
    const subtitle = elements.find((el) => el.role === "subtitle");
    const body = elements.find((el) => el.role === "body");
    return (
      <div className="slide-layout-hero">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        {subtitle && (
          <SlideElement el={subtitle} theme={theme} layout={layout} />
        )}
        {body && <SlideElement el={body} theme={theme} layout={layout} />}
      </div>
    );
  }

  if (layout === "big_number") {
    const title = elements.find((el) => el.role === "title");
    const metric = elements.find((el) => el.role === "metric");
    const body = elements.find((el) => el.role === "body");
    return (
      <div className="slide-layout-big-number">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        {metric && <SlideElement el={metric} theme={theme} layout={layout} />}
        {body && <SlideElement el={body} theme={theme} layout={layout} />}
      </div>
    );
  }

  if (layout === "two_column") {
    const title = elements.find((el) => el.role === "title");
    const cols = elements.filter((el) => el.role === "body");
    return (
      <div className="slide-layout-two-col">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className="slide-two-col-row">
          {cols.map((col) => (
            <SlideElement
              key={col.id}
              el={col}
              theme={theme}
              layout={layout}
            />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "comparison_matrix") {
    return (
      <div className="slide-layout-matrix">
        {elements.map((el) => (
          <SlideElement key={el.id} el={el} theme={theme} layout={layout} />
        ))}
      </div>
    );
  }

  if (layout === "chart_focus") {
    return (
      <div className="slide-layout-chart">
        {elements.map((el) => (
          <SlideElement key={el.id} el={el} theme={theme} layout={layout} />
        ))}
      </div>
    );
  }

  // Default: title_content, timeline_horizontal, quote_focus, etc.
  return (
    <div className="slide-layout-default">
      {elements.map((el) => (
        <SlideElement key={el.id} el={el} theme={theme} layout={layout} />
      ))}
    </div>
  );
}

export function SlidePreview() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);
  const nextSlide = useStore((s) => s.nextSlide);
  const prevSlide = useStore((s) => s.prevSlide);

  if (!deck) {
    return (
      <div className="slide-preview-empty">
        <div className="slide-preview-empty-inner">
          <span className="empty-icon">OD</span>
          <p>Load a deck to begin editing</p>
        </div>
      </div>
    );
  }

  const slide = deck.slides[currentSlideIndex];
  if (!slide) return null;

  const theme = deck.theme;

  return (
    <div className="slide-preview">
      <div className="slide-preview-area">
        <div
          className="slide-canvas"
          style={{ background: theme.colors.background }}
        >
          {renderSlideLayout(slide, theme)}
        </div>
      </div>
      <div className="slide-preview-controls">
        <button
          className="slide-nav-btn"
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
        >
          &larr;
        </button>
        <span className="slide-nav-indicator">
          {currentSlideIndex + 1} / {deck.slides.length}
        </span>
        <button
          className="slide-nav-btn"
          onClick={nextSlide}
          disabled={currentSlideIndex === deck.slides.length - 1}
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
