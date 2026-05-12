import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store";
import type { SlideData, ElementData } from "../types";
import { QualityTab } from "./QualityTab";
import { ImagePanel } from "./ImagePanel";

type TabId = "structure" | "content" | "style" | "layout" | "theme" | "notes" | "quality";

/* ------------------------------------------------------------------ */
/*  Layout definitions                                                 */
/* ------------------------------------------------------------------ */

function useLayouts() {
  const { t } = useTranslation();
  return [
    { id: "hero_title", label: t("layout.hero_title") },
    { id: "title_content", label: t("layout.title_content") },
    { id: "two_column", label: t("layout.two_column") },
    { id: "three_column", label: t("layout.three_column") },
    { id: "big_number", label: t("layout.big_number") },
    { id: "comparison_matrix", label: t("layout.comparison") },
    { id: "timeline_horizontal", label: t("layout.timeline_h") },
    { id: "timeline_vertical", label: t("layout.timeline_v") },
    { id: "process_flow", label: t("layout.process_flow") },
    { id: "chart_focus", label: t("layout.chart_focus") },
    { id: "image_left_text_right", label: t("layout.image_left") },
    { id: "image_right_text_left", label: t("layout.image_right") },
    { id: "quote_focus", label: t("layout.quote") },
    { id: "grid_cards", label: t("layout.grid_cards") },
    { id: "case_study", label: t("layout.case_study") },
    { id: "section_divider", label: t("layout.section") },
    { id: "problem", label: t("layout.problem") },
    { id: "solution", label: t("layout.solution") },
    { id: "closing", label: t("layout.closing") },
  ];
}

/* ------------------------------------------------------------------ */
/*  Structure Tab                                                      */
/* ------------------------------------------------------------------ */

function StructureTab({ slide }: { slide: SlideData }) {
  const { t } = useTranslation();
  return (
    <div className="inspector-section">
      <div className="inspector-field">
        <span className="inspector-label">{t("inspector.label_type")}</span>
        <span className="inspector-value">{slide.type}</span>
      </div>
      <div className="inspector-field">
        <span className="inspector-label">{t("inspector.label_layout")}</span>
        <span className="inspector-value">{slide.layout}</span>
      </div>
      {slide.communicationGoal && (
        <div className="inspector-field">
          <span className="inspector-label">{t("inspector.label_goal")}</span>
          <span className="inspector-value inspector-value-wrap">
            {slide.communicationGoal}
          </span>
        </div>
      )}
      {slide.mainMessage && (
        <div className="inspector-field">
          <span className="inspector-label">{t("inspector.label_message")}</span>
          <span className="inspector-value inspector-value-wrap">
            {slide.mainMessage}
          </span>
        </div>
      )}
      <div className="inspector-divider" />
      <span className="inspector-section-title">{t("inspector.section_elements")}</span>
      <div className="inspector-element-list">
        {slide.elements.map((el) => (
          <ElementRow key={el.id} el={el} />
        ))}
      </div>
    </div>
  );
}

function ElementRow({ el }: { el: ElementData }) {
  const typeIcons: Record<string, string> = {
    text: "T",
    table: "#",
    chart: "/",
    image: "+",
  };

  return (
    <div className="inspector-element-row">
      <span className="inspector-element-icon">{typeIcons[el.type] || "?"}</span>
      <div className="inspector-element-info">
        <span className="inspector-element-role">{el.role}</span>
        <span className="inspector-element-type">{el.type}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Content Tab                                                        */
/* ------------------------------------------------------------------ */

function ContentTab({
  slide,
  slideIndex,
}: {
  slide: SlideData;
  slideIndex: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="inspector-section">
      {slide.elements.map((el) => (
        <ContentField key={el.id} el={el} slideIndex={slideIndex} t={t} />
      ))}
    </div>
  );
}

function ContentField({
  el,
  slideIndex,
  t,
}: {
  el: ElementData;
  slideIndex: number;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const updateSlideContent = useStore((s) => s.updateSlideContent);
  const [localValue, setLocalValue] = useState<string | null>(null);

  const commitValue = useCallback(() => {
    if (localValue !== null) {
      updateSlideContent(slideIndex, el.id, localValue);
      setLocalValue(null);
    }
  }, [localValue, slideIndex, el.id, updateSlideContent]);

  if (el.type === "table") {
    return (
      <div className="inspector-content-block">
        <span className="inspector-label">{el.role} (table)</span>
        {el.headers && (
          <div className="inspector-table-info">
            {t("inspector.table_info", { cols: el.headers.length, rows: el.rows?.length || 0 })}
          </div>
        )}
      </div>
    );
  }

  if (el.type === "chart") {
    return (
      <div className="inspector-content-block">
        <span className="inspector-label">{el.role} (chart)</span>
          <div className="inspector-table-info">
            {t("inspector.chart_info", { type: el.chartType, points: el.data?.categories.length || 0 })}
          </div>
      </div>
    );
  }

  return (
    <div className="inspector-content-block">
      <label className="inspector-label">{el.role}</label>
      <textarea
        className="inspector-textarea inspector-textarea-editable"
        value={localValue ?? (el.content || "")}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commitValue();
          }
        }}
        rows={3}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Style Tab (element-level styling)                                  */
/* ------------------------------------------------------------------ */

function StyleTab({
  slide,
  slideIndex,
}: {
  slide: SlideData;
  slideIndex: number;
}) {
  const { t } = useTranslation();
  const updateSlideElementStyle = useStore((s) => s.updateSlideElementStyle);
  const [selectedId, setSelectedId] = useState<string | null>(
    slide.elements[0]?.id ?? null
  );
  const [localStyle, setLocalStyle] = useState<Record<string, string>>({});

  const selectedEl = slide.elements.find((el) => el.id === selectedId) ?? null;

  const commitStyle = useCallback(() => {
    if (!selectedId || Object.keys(localStyle).length === 0) return;
    updateSlideElementStyle(slideIndex, selectedId, localStyle);
    setLocalStyle({});
  }, [localStyle, selectedId, slideIndex, updateSlideElementStyle]);

  const getVal = (key: string): string => {
    if (localStyle[key] !== undefined) return localStyle[key];
    if (selectedEl?.style && key in selectedEl.style)
      return String(selectedEl.style[key]);
    return "";
  };

  const setLocal = (key: string, value: string) => {
    setLocalStyle((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="inspector-section">
      {/* Element selector */}
      <div className="inspector-field">
        <span className="inspector-label">{t("inspector.label_element")}</span>
        <select
          className="inspector-select"
          value={selectedId ?? ""}
          onChange={(e) => {
            commitStyle();
            setSelectedId(e.target.value);
            setLocalStyle({});
          }}
        >
          {slide.elements.map((el) => (
            <option key={el.id} value={el.id}>
              {el.role} ({el.type})
            </option>
          ))}
        </select>
      </div>

      {selectedEl && selectedEl.type === "text" && (
        <>
          <div className="inspector-divider" />
          <span className="inspector-section-title">{t("inspector.section_typography")}</span>

          {/* Font size */}
          <div className="inspector-field">
            <span className="inspector-label">{t("inspector.label_font_size")}</span>
            <input
              type="number"
              className="inspector-input"
              min={12}
              max={72}
              value={getVal("fontSize") || ""}
              placeholder="inherit"
              onChange={(e) => setLocal("fontSize", e.target.value)}
              onBlur={commitStyle}
            />
          </div>

          {/* Font weight */}
          <div className="inspector-field">
            <span className="inspector-label">{t("inspector.label_font_weight")}</span>
            <select
              className="inspector-select"
              value={getVal("fontWeight") || ""}
              onChange={(e) => {
                setLocal("fontWeight", e.target.value);
                // commit immediately for select
                if (selectedId) {
                  updateSlideElementStyle(slideIndex, selectedId, {
                    fontWeight: e.target.value,
                  });
                }
              }}
            >
              <option value="">inherit</option>
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          <div className="inspector-divider" />
          <span className="inspector-section-title">{t("inspector.section_colors")}</span>

          {/* Text color */}
          <div className="inspector-field">
            <span className="inspector-label">{t("inspector.label_text_color")}</span>
            <div className="inspector-color-input-row">
              <input
                type="color"
                className="inspector-color-picker"
                value={getVal("color") || "#e0e0e0"}
                onChange={(e) => setLocal("color", e.target.value)}
                onBlur={commitStyle}
              />
              <input
                type="text"
                className="inspector-input inspector-input-compact"
                value={getVal("color") || ""}
                placeholder="inherit"
                onChange={(e) => setLocal("color", e.target.value)}
                onBlur={commitStyle}
              />
            </div>
          </div>

          {/* Background color */}
          <div className="inspector-field">
            <span className="inspector-label">{t("inspector.label_bg_color")}</span>
            <div className="inspector-color-input-row">
              <input
                type="color"
                className="inspector-color-picker"
                value={getVal("backgroundColor") || "#000000"}
                onChange={(e) => setLocal("backgroundColor", e.target.value)}
                onBlur={commitStyle}
              />
              <input
                type="text"
                className="inspector-input inspector-input-compact"
                value={getVal("backgroundColor") || ""}
                placeholder="transparent"
                onChange={(e) => setLocal("backgroundColor", e.target.value)}
                onBlur={commitStyle}
              />
            </div>
          </div>
        </>
      )}

      {selectedEl && selectedEl.type !== "text" && (
        <div className="inspector-style-hint">{t("inspector.style_hint")}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout Tab                                                         */
/* ------------------------------------------------------------------ */

function LayoutTab({
  slide,
  slideIndex,
}: {
  slide: SlideData;
  slideIndex: number;
}) {
  const { t } = useTranslation();
  const LAYOUTS = useLayouts();
  const updateSlideLayout = useStore((s) => s.updateSlideLayout);

  return (
    <div className="inspector-section">
      <span className="inspector-section-title">{t("inspector.section_slide_layout")}</span>
      <div className="inspector-layout-grid">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            className={`inspector-layout-card ${
              slide.layout === layout.id ? "inspector-layout-card-active" : ""
            }`}
            onClick={() => updateSlideLayout(slideIndex, layout.id)}
            title={layout.id}
          >
            <span className="inspector-layout-card-label">{layout.label}</span>
            <span className="inspector-layout-card-id">{layout.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Tab (existing style display)                                 */
/* ------------------------------------------------------------------ */

function ThemeTab() {
  const theme = useStore((s) => s.deck?.theme);
  if (!theme) return null;

  const colorEntries = Object.entries(theme.colors).filter(
    ([k]) => k !== "chartColors"
  );

  return (
    <div className="inspector-section">
      <span className="inspector-section-title">Theme</span>
      <div className="inspector-field">
        <span className="inspector-label">Name</span>
        <span className="inspector-value">{theme.name}</span>
      </div>
      <div className="inspector-field">
        <span className="inspector-label">Style</span>
        <span className="inspector-value">{theme.style}</span>
      </div>
      <div className="inspector-divider" />
      <span className="inspector-section-title">Colors</span>
      <div className="inspector-color-grid">
        {colorEntries.map(([key, value]) => (
          <div key={key} className="inspector-color-swatch">
            <div
              className="inspector-color-box"
              style={{ background: value as string }}
            />
            <span className="inspector-color-name">{key}</span>
          </div>
        ))}
      </div>
      <div className="inspector-divider" />
      <span className="inspector-section-title">Typography</span>
      <div className="inspector-field">
        <span className="inspector-label">Title</span>
        <span className="inspector-value">
          {theme.typography.titleFont} {theme.typography.titleSize}px
        </span>
      </div>
      <div className="inspector-field">
        <span className="inspector-label">Body</span>
        <span className="inspector-value">
          {theme.typography.bodyFont} {theme.typography.bodySize}px
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notes Tab                                                          */
/* ------------------------------------------------------------------ */

function NotesTab({ slide }: { slide: SlideData }) {
  const { t } = useTranslation();
  return (
    <div className="inspector-section">
      <label className="inspector-label">{t("inspector.tab_notes")}</label>
      <textarea
        className="inspector-textarea inspector-textarea-tall"
        placeholder={t("inspector.notes_placeholder")}
        value={slide.mainMessage || ""}
        readOnly
        rows={8}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab definitions & main Inspector                                   */
/* ------------------------------------------------------------------ */

function useTabs() {
  const { t } = useTranslation();
  return [
    { id: "structure" as TabId, label: t("inspector.tab_structure") },
    { id: "content" as TabId, label: t("inspector.tab_content") },
    { id: "style" as TabId, label: t("inspector.tab_style") },
    { id: "layout" as TabId, label: t("inspector.tab_layout") },
    { id: "theme" as TabId, label: t("inspector.tab_theme") },
    { id: "quality" as TabId, label: t("inspector.tab_quality") },
    { id: "notes" as TabId, label: t("inspector.tab_notes") },
  ];
}

export function Inspector() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);
  const [activeTab, setActiveTab] = useState<TabId>("structure");
  const tabs = useTabs();

  if (!deck) return null;

  const slide = deck.slides[currentSlideIndex];
  if (!slide) return null;

  return (
    <div className="inspector">
      <div className="inspector-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`inspector-tab ${activeTab === tab.id ? "inspector-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="inspector-content">
        {activeTab === "structure" && (
          <>
            <StructureTab slide={slide} />
            <div className="inspector-divider" />
            <ImagePanel slide={slide} slideIndex={currentSlideIndex} />
          </>
        )}
        {activeTab === "content" && (
          <ContentTab slide={slide} slideIndex={currentSlideIndex} />
        )}
        {activeTab === "style" && (
          <StyleTab slide={slide} slideIndex={currentSlideIndex} />
        )}
        {activeTab === "layout" && (
          <LayoutTab slide={slide} slideIndex={currentSlideIndex} />
        )}
        {activeTab === "theme" && <ThemeTab />}
        {activeTab === "quality" && <QualityTab />}
        {activeTab === "notes" && <NotesTab slide={slide} />}
      </div>
    </div>
  );
}
