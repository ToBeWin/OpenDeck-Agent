import { useState } from "react";

interface WelcomeViewProps {
  onGenerate: (prompt: string) => void;
}

const examplePrompts = [
  "2025年AI行业趋势分析",
  "Q3业务复盘报告",
  "新产品发布方案",
  "团队OKR回顾与展望",
];

export function WelcomeView({ onGenerate }: WelcomeViewProps) {
  const [prompt, setPrompt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed) {
      onGenerate(trimmed);
    }
  }

  function handleExampleClick(example: string) {
    setPrompt(example);
    onGenerate(example);
  }

  return (
    <div className="welcome-view">
      <h1 className="welcome-title">OpenDeck Agent</h1>
      <p className="welcome-subtitle">AI-powered presentation creation</p>
      <form onSubmit={handleSubmit} className="welcome-input-area">
        <textarea
          className="welcome-textarea"
          placeholder="Describe the presentation you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <button className="welcome-submit" type="submit">
          Generate
        </button>
      </form>
      <div className="welcome-examples">
        {examplePrompts.map((example) => (
          <button
            key={example}
            className="welcome-example-card"
            onClick={() => handleExampleClick(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
