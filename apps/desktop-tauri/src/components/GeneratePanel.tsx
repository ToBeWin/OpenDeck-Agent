import { useState } from "react";
import { generateTestPptx, type RenderResult } from "../lib/tauri";

export function GeneratePanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateTestPptx();
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Test PPTX"}
      </button>

      {error && (
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3>Generation Successful</h3>
          <div className="file-path">
            <span className="label">File:</span>
            <span className="path">{result.file_path}</span>
          </div>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">{result.stats.slide_count}</span>
              <span className="stat-label">Slides</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.stats.editable_text_count}</span>
              <span className="stat-label">Text Objects</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.stats.image_count}</span>
              <span className="stat-label">Images</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.stats.chart_count}</span>
              <span className="stat-label">Charts</span>
            </div>
            <div className="stat">
              <span className="stat-value">{result.stats.table_count}</span>
              <span className="stat-label">Tables</span>
            </div>
          </div>
          {result.warnings.length > 0 && (
            <div className="warnings">
              <strong>Warnings:</strong>
              <ul>
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
