import { useState } from "react";
import { useStore } from "../store";
import type { SlideData } from "../types";

const IMAGE_STYLES = [
  { value: "natural", labelKey: "natural" },
  { value: "artistic", labelKey: "artistic" },
  { value: "photographic", labelKey: "photographic" },
  { value: "illustration", labelKey: "illustration" },
];

export function ImagePanel({ slide, slideIndex }: { slide: SlideData; slideIndex: number }) {
  const generateImageForSlide = useStore((s) => s.generateImageForSlide);
  const loading = useStore((s) => s.loading);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("natural");

  const slideImages = slide.elements.filter((el) => el.type === "image");

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    const stylePrompt = style !== "natural" ? `, ${style} style` : "";
    await generateImageForSlide(slideIndex, trimmed + stylePrompt);
    setPrompt("");
  }

  return (
    <div className="inspector-section">
      <span className="inspector-section-title">Images</span>

      {slideImages.length > 0 && (
        <div className="inspector-image-list">
          {slideImages.map((img, i) => (
            <div key={img.id || i} className="inspector-image-item">
              {img.source && (
                <div className="inspector-image-preview">
                  {img.source.startsWith("data:") || img.source.startsWith("http") ? (
                    <img src={img.source} alt={img.role} style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 6 }} />
                  ) : (
                    <div className="inspector-image-placeholder">{img.role}</div>
                  )}
                </div>
              )}
              {img.generationPrompt && (
                <span className="inspector-image-prompt">{img.generationPrompt}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="inspector-divider" />
      <span className="inspector-section-title">Generate New Image</span>

      <textarea
        className="inspector-textarea"
        placeholder="Describe the image you want to generate..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
      />

      <div className="inspector-field">
        <span className="inspector-label">Style</span>
        <select
          className="inspector-select"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {IMAGE_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.labelKey}
            </option>
          ))}
        </select>
      </div>

      <button
        className="inspector-image-generate-btn"
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
    </div>
  );
}
