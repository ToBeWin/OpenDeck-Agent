import { useState, useCallback } from "react";
import { useStore } from "../store";
import type { SlideData, ElementData } from "../types";

type TabId = "structure" | "content" | "style" | "layout" | "theme" | "notes";

/* ------------------------------------------------------------------ */
/*  Layout definitions                                                 */
/* ------------------------------------------------------------------ */

const LAYOUTS: { id: string; label: string }[] = [
  { id: "hero_title", label: "Hero Title" },
  { id: "title_content", label: "Title + Content" },
  { id: "two_column", label: "Two Column" },
  { id: "three_column", label: "Three Column" },
  { id: "big_number", label: "Big Number" },
  { id: "comparison_matrix", label: "Comparison" },
  { id: "timeline_horizontal", label: "Timeline (H)" },
  { id: "timeline_vertical", label: "Timeline (V)" },
  { id: "process_flow", label: "Process Flow" },
  { id: "chart_focus", label: "Chart Focus" },
  { id: "image_left_text_right", label: "Image Left" },
  { id: "image_right_text_left", label: "Image Right" },
  { id: "quote_focus", label: "Quote" },
  { id: "grid_cards", label: "Grid Cards" },
  { id: "case_study", label: "Case Study" },
  { id: "section_divider", label: "Section" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "closing", label: "Closing" },
];

/* ------------------------------------------------------------------ */
/*  Structure Tab                                                      */
/* ------------------------------------------------------------------ */

function StructureTab({ slide }: { slide: SlideData }) {
  return (
    <div className="inspector-section">
      <div className="inspector-field">
        <span className="inspector-label">Type</span>
        <span className="inspector-value">{slide.type}</span>
      </div>
      <div className="inspector-field">
        <span className="inspector-label">Layout</span>
        <span className="inspector-value">{slide.layout}</span>
      </div>
      {slide.communicationGoal && (
        <div className="inspector-field">
          <span className="inspector-label">Goal</span>
          <span className="inspector-value inspector-value-wrap">
            {slide.communicationGoal}
          </span>
        </div>
      )}
      {slide.mainMessage && (
        <div className="inspector-field">
          <span className="inspector-label">Message</span>
          <span className="inspector-value inspector-value-wrap">
            {slide.mainMessage}
          </span>
        </div>
      )}
      <div className="inspector-divider" />
      <span className="inspector-section-title">Elements</span>
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
  return (
    <div className="inspector-section">
      {slide.elements.map((el) => (
        <ContentField key={el.id} el={el} slideIndex={slideIndex} />
      ))}
    </div>
  );
}

function ContentField({
  el,
  slideIndex,
}: {
  el: ElementData;
  slideIndex: number;
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
            {el.headers.length} columns, {el.rows?.length || 0} rows
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
          {el.chartType} chart &mdash; {el.data?.categories.length || 0} data
          points
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
        <span className="inspector-label">Element</span>
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
          <span className="inspector-section-title">Typography</span>

          {/* Font size */}
          <div className="inspector-field">
            <span className="inspector-label">Font Size</span>
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
            <span className="inspector-label">Font Weight</span>
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
          <span className="inspector-section-title">Colors</span>

          {/* Text color */}
          <div className="inspector-field">
            <span className="inspector-label">Text Color</span>
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
            <span className="inspector-label">Background Color</span>
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
        <div className="inspector-style-hint">
          Style controls are available for text elements.
        </div>
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
  const updateSlideLayout = useStore((s) => s.updateSlideLayout);

  return (
    <div className="inspector-section">
      <span className="inspector-section-title">Slide Layout</span>
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
  return (
    <div className="inspector-section">
      <label className="inspector-label">Speaker Notes</label>
      <textarea
        className="inspector-textarea inspector-textarea-tall"
        placeholder="Add speaker notes for this slide..."
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

const tabs: { id: TabId; label: string }[] = [
  { id: "structure", label: "Structure" },
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "layout", label: "Layout" },
  { id: "theme", label: "Theme" },
  { id: "notes", label: "Notes" },
];

export function Inspector() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);
  const [activeTab, setActiveTab] = useState<TabId>("structure");

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
        {activeTab === "structure" && <StructureTab slide={slide} />}
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
        {activeTab === "notes" && <NotesTab slide={slide} />}
      </div>
    </div>
  );
}
