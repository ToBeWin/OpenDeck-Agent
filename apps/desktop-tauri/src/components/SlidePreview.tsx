import { useState } from "react";
import { useStore } from "../store";
import { WelcomeView } from "./WelcomeView";
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

function LineChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const w = 400;
  const h = 200;
  const padX = 30;
  const padBottom = 30;
  const plotW = w - padX * 2;
  const plotH = h - padBottom - 10;

  const points = values.map((v, i) => ({
    x: padX + (i / Math.max(values.length - 1, 1)) * plotW,
    y: 10 + plotH - (v / max) * plotH,
  }));
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const strokeColor = colors.chartColors[0] || colors.accent;

  return (
    <div className="chart-line">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={colors.chartColors[i % colors.chartColors.length]}
            stroke={colors.background}
            strokeWidth="1.5"
          />
        ))}
        {categories.map((cat, i) => (
          <text
            key={i}
            x={points[i]?.x ?? 0}
            y={h - 4}
            textAnchor="middle"
            fontSize="10"
            fill={colors.textSecondary}
          >
            {cat}
          </text>
        ))}
      </svg>
    </div>
  );
}

function PieChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  if (values.length === 0) return null;
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const segments = values.map((v, i) => {
    const pct = v / total;
    const dashLen = pct * circumference;
    const dashOffset = -cumulative * circumference;
    cumulative += pct;
    return {
      dashLen,
      dashOffset,
      color: colors.chartColors[i % colors.chartColors.length],
      label: categories[i] ?? `Series ${i + 1}`,
      pct,
    };
  });

  return (
    <div className="chart-pie">
      <svg viewBox="0 0 200 200" className="chart-pie-svg">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="40"
            strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
            strokeDashoffset={seg.dashOffset}
            transform="rotate(-90 100 100)"
          />
        ))}
      </svg>
      <div className="chart-pie-legend">
        {segments.map((seg, i) => (
          <div key={i} className="chart-pie-legend-item">
            <span className="chart-pie-legend-dot" style={{ background: seg.color }} />
            <span className="chart-pie-legend-label">{seg.label}</span>
            <span className="chart-pie-legend-value">{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const w = 400;
  const h = 200;
  const padX = 30;
  const padBottom = 30;
  const plotW = w - padX * 2;
  const plotH = h - padBottom - 10;

  const points = values.map((v, i) => ({
    x: padX + (i / Math.max(values.length - 1, 1)) * plotW,
    y: 10 + plotH - (v / max) * plotH,
  }));

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const bottomY = 10 + plotH;
  const polygonPoints = `${points[0].x},${bottomY} ${linePoints} ${points[points.length - 1].x},${bottomY}`;
  const fillColor = colors.chartColors[0] || colors.accent;
  const strokeColor = fillColor;

  return (
    <div className="chart-area">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <polygon
          points={polygonPoints}
          fill={fillColor}
          fillOpacity="0.25"
          stroke="none"
        />
        <polyline
          points={linePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={colors.chartColors[i % colors.chartColors.length]}
            stroke={colors.background}
            strokeWidth="1.5"
          />
        ))}
        {categories.map((cat, i) => (
          <text
            key={i}
            x={points[i]?.x ?? 0}
            y={h - 4}
            textAnchor="middle"
            fontSize="10"
            fill={colors.textSecondary}
          >
            {cat}
          </text>
        ))}
      </svg>
    </div>
  );
}

function ChartElement({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  switch (data.chartType) {
    case "line":
      return <LineChart data={data} colors={colors} />;
    case "pie":
      return <PieChart data={data} colors={colors} />;
    case "area":
      return <AreaChart data={data} colors={colors} />;
    case "bar":
    default:
      return <BarChart data={data} colors={colors} />;
  }
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
    return <ChartElement data={el} colors={colors} />;
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

  if (layout === "process_flow") {
    const title = elements.find((el) => el.role === "title");
    const steps = elements.filter((el) => el.role === "body");
    return (
      <div className="slide-layout-process">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className="process-steps">
          {steps.map((step, i) => (
            <div key={step.id} className="process-step">
              <div className="process-step-number" style={{ background: theme.colors.accent }}>
                {i + 1}
              </div>
              <SlideElement el={step} theme={theme} layout={layout} />
              {i < steps.length - 1 && (
                <div className="process-step-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "timeline_horizontal" || layout === "timeline_vertical") {
    const title = elements.find((el) => el.role === "title");
    const items = elements.filter((el) => el.role === "body");
    return (
      <div className={`slide-layout-timeline ${layout === "timeline_vertical" ? "timeline-vertical" : ""}`}>
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className="timeline-items">
          {items.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-dot" style={{ background: theme.colors.accent }} />
              <div className="timeline-line" style={{ background: theme.colors.border }} />
              <SlideElement el={item} theme={theme} layout={layout} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "quote_focus" || layout === "quote") {
    const quote = elements.find((el) => el.type === "text");
    const attribution = elements.find((el) => el.role === "subtitle" || el.role === "caption");
    return (
      <div className="slide-layout-quote">
        <div className="quote-mark" style={{ color: theme.colors.accent }}>"</div>
        {quote && <SlideElement el={quote} theme={theme} layout={layout} />}
        {attribution && (
          <p className="quote-attribution" style={{ color: theme.colors.textSecondary }}>
            — {attribution.content}
          </p>
        )}
      </div>
    );
  }

  if (layout === "section_divider") {
    const title = elements.find((el) => el.role === "title");
    const subtitle = elements.find((el) => el.role === "subtitle");
    return (
      <div className="slide-layout-section-divider">
        <div className="section-divider-line" style={{ background: theme.colors.accent }} />
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        {subtitle && <SlideElement el={subtitle} theme={theme} layout={layout} />}
        <div className="section-divider-line" style={{ background: theme.colors.accent }} />
      </div>
    );
  }

  if (layout === "grid_cards") {
    const title = elements.find((el) => el.role === "title");
    const cards = elements.filter((el) => el.role === "body");
    return (
      <div className="slide-layout-grid">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className="grid-cards">
          {cards.map((card) => (
            <div key={card.id} className="grid-card" style={{
              background: theme.colors.surface,
              borderColor: theme.colors.border,
            }}>
              <SlideElement el={card} theme={theme} layout={layout} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "problem" || layout === "solution") {
    const title = elements.find((el) => el.role === "title");
    const items = elements.filter((el) => el.role === "body");
    const icon = layout === "problem" ? "⚠" : "✓";
    return (
      <div className={`slide-layout-${layout}`}>
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className={`${layout}-items`}>
          {items.map((item) => (
            <div key={item.id} className={`${layout}-item`} style={{
              borderColor: layout === "problem" ? theme.colors.warning : theme.colors.success,
            }}>
              <span className={`${layout}-icon`} style={{
                color: layout === "problem" ? theme.colors.warning : theme.colors.success,
              }}>{icon}</span>
              <SlideElement el={item} theme={theme} layout={layout} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "three_column") {
    const title = elements.find((el) => el.role === "title");
    const cols = elements.filter((el) => el.role === "body");
    return (
      <div className="slide-layout-three-col">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className="slide-three-col-row">
          {cols.map((col) => (
            <SlideElement
              key={col.id}
              el={col}
              theme={theme}
              layout="two_column"
            />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "case_study") {
    const title = elements.find((el) => el.role === "title");
    const labels = elements.filter((el) => el.role === "label");
    const bodies = elements.filter((el) => el.role === "body");
    return (
      <div className="slide-layout-case-study">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className="case-study-sections">
          {labels.map((label, i) => (
            <div key={label.id} className="case-study-section" style={{ borderColor: theme.colors.accent }}>
              <p className="case-study-label" style={{ color: theme.colors.accent }}>{label.content}</p>
              {bodies[i] && <SlideElement el={bodies[i]} theme={theme} layout={layout} />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "closing") {
    const title = elements.find((el) => el.role === "title");
    const subtitle = elements.find((el) => el.role === "subtitle");
    const body = elements.find((el) => el.role === "body");
    return (
      <div className="slide-layout-closing">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        {subtitle && <SlideElement el={subtitle} theme={theme} layout={layout} />}
        {body && <SlideElement el={body} theme={theme} layout={layout} />}
      </div>
    );
  }

  if (layout === "image_left_text_right" || layout === "image_right_text_left") {
    const title = elements.find((el) => el.role === "title");
    const image = elements.find((el) => el.type === "image");
    const bodies = elements.filter((el) => el.role === "body");
    const isImageLeft = layout === "image_left_text_right";
    return (
      <div className="slide-layout-image-text">
        {title && <SlideElement el={title} theme={theme} layout={layout} />}
        <div className={`image-text-row ${isImageLeft ? "" : "image-text-reverse"}`}>
          {image && (
            <div className="image-text-image" style={{ background: theme.colors.surface, borderColor: theme.colors.border }}>
              <span style={{ color: theme.colors.textSecondary }}>[Image]</span>
            </div>
          )}
          <div className="image-text-content">
            {bodies.map((b) => (
              <SlideElement key={b.id} el={b} theme={theme} layout={layout} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: title_content, consulting_summary, etc.
  return (
    <div className="slide-layout-default">
      {elements.map((el) => (
        <SlideElement key={el.id} el={el} theme={theme} layout={layout} />
      ))}
    </div>
  );
}

const generationSteps = ["理解需求", "规划结构", "生成内容", "优化质量"];

function GenerationProgress({ step }: { step: string }) {
  const stepBase = step.replace("...", "");
  const activeIndex = generationSteps.indexOf(stepBase);
  const isComplete = step === "完成";

  return (
    <div className="generation-progress">
      <div className="generation-progress-spinner" />
      <div className="generation-progress-text">{step}</div>
      <div className="generation-progress-steps">
        {generationSteps.map((s, i) => (
          <span
            key={s}
            className={`progress-step ${
              isComplete || i < activeIndex
                ? "progress-step-completed"
                : i === activeIndex
                  ? "progress-step-active"
                  : ""
            }`}
          >
            {s}
            {i < generationSteps.length - 1 && (
              <span className="progress-step-arrow"> → </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SlidePreview() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);
  const nextSlide = useStore((s) => s.nextSlide);
  const prevSlide = useStore((s) => s.prevSlide);
  const generateFromPrompt = useStore((s) => s.generateFromPrompt);
  const generationStep = useStore((s) => s.generationStep);

  if (!deck) {
    return (
      <div className="slide-preview">
        <WelcomeView onGenerate={generateFromPrompt} />
      </div>
    );
  }

  const slide = deck.slides[currentSlideIndex];
  if (!slide) return null;

  const [showNotes, setShowNotes] = useState(!!slide.speakerNote);

  const theme = deck.theme;
  const showProgress = generationStep !== null && generationStep !== "完成";

  return (
    <div className="slide-preview">
      <div className="slide-preview-area">
        <div
          className="slide-canvas"
          style={{ background: theme.colors.background }}
        >
          {renderSlideLayout(slide, theme)}
          {showProgress && <GenerationProgress step={generationStep} />}
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
        {slide.speakerNote && (
          <button
            className="slide-nav-btn speaker-notes-toggle"
            onClick={() => setShowNotes(!showNotes)}
            title="Toggle Speaker Notes"
            style={{ fontSize: '12px' }}
          >
            {showNotes ? '📝' : '📝'}
          </button>
        )}
      </div>
      {showNotes && slide.speakerNote && (
        <div className="speaker-notes">
          <div className="speaker-notes-header">
            <span className="speaker-notes-icon">📝</span>
            <span className="speaker-notes-title">Speaker Notes</span>
          </div>
          <p className="speaker-notes-text">{slide.speakerNote}</p>
        </div>
      )}
    </div>
  );
}
