import { useState } from "react";
import { useStore } from "../store";
import type { SlideData, ElementData } from "../types";

type TabId = "structure" | "content" | "style" | "notes";

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

function ContentTab({ slide }: { slide: SlideData }) {
  return (
    <div className="inspector-section">
      {slide.elements.map((el) => (
        <ContentField key={el.id} el={el} />
      ))}
    </div>
  );
}

function ContentField({ el }: { el: ElementData }) {
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
        className="inspector-textarea"
        value={el.content || ""}
        readOnly
        rows={3}
      />
    </div>
  );
}

function StyleTab() {
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

const tabs: { id: TabId; label: string }[] = [
  { id: "structure", label: "Structure" },
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
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
        {activeTab === "content" && <ContentTab slide={slide} />}
        {activeTab === "style" && <StyleTab />}
        {activeTab === "notes" && <NotesTab slide={slide} />}
      </div>
    </div>
  );
}
