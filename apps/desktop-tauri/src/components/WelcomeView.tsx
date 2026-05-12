import { useState } from "react";
import { useTranslation } from "react-i18next";

interface WelcomeViewProps {
  onGenerate: (prompt: string) => void;
}

const exampleKeys = [
  { category: "business", textKey: "welcome.examples_business", descKey: "welcome.examples_business_desc" },
  { category: "technology", textKey: "welcome.examples_tech", descKey: "welcome.examples_tech_desc" },
  { category: "strategy", textKey: "welcome.examples_strategy", descKey: "welcome.examples_strategy_desc" },
  { category: "education", textKey: "welcome.examples_education", descKey: "welcome.examples_education_desc" },
  { category: "business", textKey: "welcome.examples_startup", descKey: "welcome.examples_startup_desc" },
  { category: "technology", textKey: "welcome.examples_industry", descKey: "welcome.examples_industry_desc" },
  { category: "strategy", textKey: "welcome.examples_marketing", descKey: "welcome.examples_marketing_desc" },
  { category: "education", textKey: "welcome.examples_research", descKey: "welcome.examples_research_desc" },
];

export function WelcomeView({ onGenerate }: WelcomeViewProps) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed) onGenerate(trimmed);
  }

  function handleExampleClick(example: string) {
    setPrompt(example);
    onGenerate(example);
  }

  const catLabel: Record<string, string> = {
    business: t("welcome.category_business"),
    technology: t("welcome.category_technology"),
    strategy: t("welcome.category_strategy"),
    education: t("welcome.category_education"),
  };

  return (
    <div className="welcome-view">
      <h1 className="welcome-title">OpenDeck Agent</h1>
      <p className="welcome-subtitle">{t("welcome.title")}</p>
      <form onSubmit={handleSubmit} className="welcome-input-area">
        <textarea
          className="welcome-textarea"
          placeholder={t("welcome.placeholder")}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <button className="welcome-submit" type="submit">
          {t("welcome.generate")}
        </button>
      </form>
      <div className="welcome-examples">
        {exampleKeys.map((ex) => (
          <button
            key={ex.textKey}
            className="welcome-example-card"
            onClick={() => handleExampleClick(t(ex.textKey))}
          >
            <span className={`example-category-tag example-category-${ex.category}`}>
              {catLabel[ex.category]}
            </span>
            <span className="example-card-text">{t(ex.descKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
