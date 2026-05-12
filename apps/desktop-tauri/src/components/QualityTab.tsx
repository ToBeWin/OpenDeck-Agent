import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store";

function getScoreColor(score: number): string {
  if (score >= 80) return "#00c853";
  if (score >= 60) return "#ffab00";
  return "#ff1744";
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  return (
    <div className="quality-score-ring">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#2a2a4a" strokeWidth="4" />
        <circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="4"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
        <text x="24" y="24" textAnchor="middle" dominantBaseline="central"
          fill="#e0e0e0" fontSize="12" fontWeight="bold">
          {score}
        </text>
      </svg>
      <span className="quality-score-label">{label}</span>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="quality-bar-row">
      <span className="quality-bar-label">{label}</span>
      <div className="quality-bar-track">
        <div
          className="quality-bar-fill"
          style={{ width: `${score}%`, background: getScoreColor(score) }}
        />
      </div>
      <span className="quality-bar-value" style={{ color: getScoreColor(score) }}>
        {score}
      </span>
    </div>
  );
}

interface DeckQualityScore {
  overall: number;
  content: number;
  logic: number;
  visual: number;
  editability: number;
  consistency: number;
  compatibility: number;
  slides: Array<{
    slideId: string;
    overall: number;
    content: number;
    visual: number;
    editability: number;
    issues: Array<{
      severity: string;
      category: string;
      slideId?: string;
      message: string;
      autoFixable: boolean;
    }>;
  }>;
  issues: Array<{
    severity: string;
    category: string;
    slideId?: string;
    message: string;
    autoFixable: boolean;
  }>;
}

export function QualityTab() {
  const deck = useStore((s) => s.deck);
  const currentSlideIndex = useStore((s) => s.currentSlideIndex);
  const [score, setScore] = useState<DeckQualityScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!deck) return;
    setLoading(true);
    const run = async () => {
      try {
        const { scoreDeck } = await import("@opendeck/quality");
        const result = scoreDeck(deck as never) as unknown as DeckQualityScore;
        setScore(result);
      } catch {
        setScore(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [deck]);

  if (!deck || !score) {
    if (loading) return <div className="inspector-section"><span className="inspector-label">Scoring...</span></div>;
    return <div className="inspector-section"><span className="inspector-label">Load a deck to see quality score</span></div>;
  }

  const currentSlide = deck.slides[currentSlideIndex];
  const slideScore = score.slides.find((s) => s.slideId === currentSlide?.id);

  const severityIcon: Record<string, string> = {
    error: "🔴",
    warning: "🟡",
    info: "🔵",
  };

  return (
    <div className="inspector-section">
      {/* Overall score */}
      <span className="inspector-section-title">Overall Quality</span>
      <div className="quality-score-rings">
        <ScoreRing score={score.overall} label="Overall" />
        <ScoreRing score={score.content} label="Content" />
        <ScoreRing score={score.visual} label="Visual" />
      </div>

      <div className="inspector-divider" />
      <span className="inspector-section-title">Category Scores</span>
      <div className="quality-bars">
        <ScoreBar score={score.content} label="Content" />
        <ScoreBar score={score.logic} label="Logic" />
        <ScoreBar score={score.visual} label="Visual" />
        <ScoreBar score={score.editability} label="Editability" />
        <ScoreBar score={score.consistency} label="Consistency" />
        <ScoreBar score={score.compatibility} label="Compatibility" />
      </div>

      {/* Current slide score */}
      {slideScore && (
        <>
          <div className="inspector-divider" />
          <span className="inspector-section-title">
            Current Slide Score: {slideScore.overall}
          </span>
          {slideScore.issues.length > 0 ? (
            <div className="quality-issues-list">
              {slideScore.issues.map((issue, i) => (
                <div key={i} className="quality-issue-row">
                  <span className="quality-issue-icon">
                    {severityIcon[issue.severity] ?? "⚪"}
                  </span>
                  <span className="quality-issue-text">{issue.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="inspector-value" style={{ color: "#00c853" }}>
              No issues found
            </span>
          )}
        </>
      )}

      {/* All deck issues */}
      {score.issues.length > 0 && (
        <>
          <div className="inspector-divider" />
          <span className="inspector-section-title">Deck Issues</span>
          <div className="quality-issues-list">
            {score.issues.slice(0, 10).map((issue, i) => (
              <div key={i} className="quality-issue-row">
                <span className="quality-issue-icon">
                  {severityIcon[issue.severity] ?? "⚪"}
                </span>
                <span className="quality-issue-text">{issue.message}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
