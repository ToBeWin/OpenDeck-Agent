import { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store";
import type { SlideData, ElementData, DeckTheme } from "../types";

function PresentationBarChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  const max = Math.max(...values, 1);

  return (
    <div className="chart-bar" style={{ height: "200px" }}>
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

function PresentationLineChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 500;
  const h = 200;
  const padding = 30;
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (w - 2 * padding);
    const y = h - padding - ((v - min) / range) * (h - 2 * padding);
    return `${x},${y}`;
  });
  const polylinePoints = points.join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: "500px" }}>
      <polyline fill="none" stroke={colors.chartColors[0]} strokeWidth="2.5" points={polylinePoints} />
      {points.map((p, i) => {
        const [cx, cy] = p.split(",").map(Number);
        return <circle key={i} cx={cx} cy={cy} r="4" fill={colors.chartColors[0]} />;
      })}
      {categories.map((label, i) => {
        const x = padding + (i / (categories.length - 1)) * (w - 2 * padding);
        return (
          <text key={i} x={x} y={h - 5} textAnchor="middle" fontSize="10" fill={colors.textSecondary}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function PresentationPieChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let cumulative = 0;
  const cx = 100;
  const cy = 100;
  const r = 80;

  const slices = values.map((v, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += v;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const largeArc = v / total > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const color = colors.chartColors[i % colors.chartColors.length];
    return (
      <path
        key={i}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
        fill={color}
        opacity={0.85}
      />
    );
  });

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 200 200" style={{ width: "200px", height: "200px" }}>
        {slices}
      </svg>
      <div className="chart-pie-legend">
        {categories.map((label, i) => (
          <div key={i} className="chart-pie-legend-item">
            <span
              className="chart-pie-legend-dot"
              style={{ background: colors.chartColors[i % colors.chartColors.length] }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresentationAreaChart({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  if (!data.data) return null;
  const { categories, series } = data.data;
  const values = series[0]?.values || [];
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 500;
  const h = 200;
  const padding = 30;
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (w - 2 * padding);
    const y = h - padding - ((v - min) / range) * (h - 2 * padding);
    return { x, y };
  });
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${padding},${h - padding} ${polylinePoints} ${w - padding},${h - padding}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: "500px" }}>
      <polygon points={areaPoints} fill={colors.chartColors[0]} opacity={0.2} />
      <polyline fill="none" stroke={colors.chartColors[0]} strokeWidth="2.5" points={polylinePoints} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={colors.chartColors[0]} />
      ))}
      {categories.map((label, i) => {
        const x = padding + (i / (categories.length - 1)) * (w - 2 * padding);
        return (
          <text key={i} x={x} y={h - 5} textAnchor="middle" fontSize="10" fill={colors.textSecondary}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function PresentationChartElement({ data, colors }: { data: ElementData; colors: DeckTheme["colors"] }) {
  const chartType = (data.style as Record<string, unknown>)?.chartType as string ?? "bar";
  switch (chartType) {
    case "line":
      return <PresentationLineChart data={data} colors={colors} />;
    case "pie":
      return <PresentationPieChart data={data} colors={colors} />;
    case "area":
      return <PresentationAreaChart data={data} colors={colors} />;
    default:
      return <PresentationBarChart data={data} colors={colors} />;
  }
}

function renderPresentationElement(el: ElementData, colors: DeckTheme["colors"]) {
  switch (el.type) {
    case "text":
      return renderPresentationText(el, colors);
    case "image":
      return (
        <div className="slide-image" key={el.id}>
          <div className="slide-image-placeholder">
            <span>[Image: {el.content || "visual"}]</span>
          </div>
        </div>
      );
    case "chart":
      return (
        <div key={el.id} style={{ textAlign: "center" }}>
          <PresentationChartElement data={el} colors={colors} />
        </div>
      );
    case "table":
      return renderPresentationTable(el, colors);
    default:
      return null;
  }
}

function renderPresentationText(el: ElementData, colors: DeckTheme["colors"]) {
  if (!el.content) return null;

  const style: React.CSSProperties = {};

  switch (el.role) {
    case "title":
      return (
        <h1 className="slide-title" style={{ fontSize: "42px" }} key={el.id}>
          {el.content}
        </h1>
      );
    case "subtitle":
      return (
        <p className="slide-subtitle" style={{ fontSize: "22px" }} key={el.id}>
          {el.content}
        </p>
      );
    case "headline":
      return (
        <h2 className="slide-headline" style={{ fontSize: "32px" }} key={el.id}>
          {el.content}
        </h2>
      );
    case "body":
      return (
        <div className="slide-body" style={{ fontSize: "18px" }} key={el.id}>
          {el.content.split("\n").map((line, i) => {
            if (!line.trim()) return null;
            if (line.startsWith("• ") || line.startsWith("- ")) {
              return (
                <div key={i} className="slide-bullet">
                  {line.replace(/^[•\-]\s*/, "")}
                </div>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={i} className="slide-numbered-item">
                  {line}
                </div>
              );
            }
            return (
              <p key={i} className="slide-paragraph">
                {line}
              </p>
            );
          })}
        </div>
      );
    case "metric":
      return (
        <div className="slide-metric" style={{ fontSize: "64px" }} key={el.id}>
          {el.content}
        </div>
      );
    case "caption":
      return (
        <p className="slide-caption" style={{ fontSize: "14px" }} key={el.id}>
          {el.content}
        </p>
      );
    case "footnote":
      return (
        <p
          className="slide-footnote"
          style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "auto" }}
          key={el.id}
        >
          {el.content}
        </p>
      );
    default:
      return (
        <p style={{ ...style, color: colors.textPrimary }} key={el.id}>
          {el.content}
        </p>
      );
  }
}

function renderPresentationTable(el: ElementData, _colors: DeckTheme["colors"]) {
  if (!el.headers) return null;
  return (
    <table className="slide-table" key={el.id}>
      <thead>
        <tr>
          {el.headers.map((h: string, i: number) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {el.rows?.map((row: string[], ri: number) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderPresentationSlide(slide: SlideData, colors: DeckTheme["colors"]) {
  return slide.elements.map((el) => renderPresentationElement(el, colors));
}

interface PresentationModeProps {
  onClose: () => void;
}

export function PresentationMode({ onClose }: PresentationModeProps) {
  const { t } = useTranslation();
  const deck = useStore((s) => s.deck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => setShowControls(false), 2000);
    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          setCurrentIndex((i) => Math.min(i + 1, (deck?.slides.length ?? 1) - 1));
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          setCurrentIndex((i) => Math.max(i - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentIndex((deck?.slides.length ?? 1) - 1);
          break;
      }
    },
    [deck, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [handleKeyDown, handleMouseMove, controlsTimeout]);

  if (!deck) return null;

  const slide = deck.slides[currentIndex];
  if (!slide) return null;

  const theme = deck.theme;

  return (
    <div
      className="presentation-mode"
      style={{ background: theme.colors.background }}
      onClick={(e) => {
        // Click right half = next, left half = prev
        const rect = e.currentTarget.getBoundingClientRect();
        if (e.clientX > rect.left + rect.width / 2) {
          setCurrentIndex((i) => Math.min(i + 1, deck.slides.length - 1));
        } else {
          setCurrentIndex((i) => Math.max(i - 1, 0));
        }
      }}
    >
      <div className="presentation-slide">
        {renderPresentationSlide(slide, theme.colors)}
      </div>

      {showControls && (
        <div className="presentation-controls">
          <button
            className="presentation-nav-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((i) => Math.max(i - 1, 0));
            }}
            disabled={currentIndex === 0}
          >
            &larr;
          </button>
          <span className="presentation-indicator">
            {currentIndex + 1} / {deck.slides.length}
          </span>
          <button
            className="presentation-nav-btn"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((i) => Math.min(i + 1, deck.slides.length - 1));
            }}
            disabled={currentIndex === deck.slides.length - 1}
          >
            &rarr;
          </button>
          <button
            className="presentation-exit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            {t("presentation.exit")} (Esc)
          </button>
        </div>
      )}
    </div>
  );
}
