import { useState } from "react";

interface WelcomeViewProps {
  onGenerate: (prompt: string) => void;
}

interface ExamplePrompt {
  category: string;
  text: string;
}

const examplePrompts: ExamplePrompt[] = [
  // Business
  {
    category: "Business",
    text: "2025年Q1业务复盘报告，包含收入增长、用户增长、市场份额变化",
  },
  {
    category: "Business",
    text: "SaaS产品商业计划书，面向投资人，突出TAM/SAM/SOM和商业模式",
  },
  // Technology
  {
    category: "Technology",
    text: "AI大模型技术趋势分析，涵盖GPT-5、Claude、Gemini等最新进展",
  },
  {
    category: "Technology",
    text: "云原生架构迁移方案，从单体到微服务的技术路线图",
  },
  // Strategy
  {
    category: "Strategy",
    text: "新能源汽车市场竞品分析，对比特斯拉、比亚迪、蔚来",
  },
  {
    category: "Strategy",
    text: "出海战略规划：东南亚市场进入策略与风险评估",
  },
  // Education
  {
    category: "Education",
    text: "深度学习入门教程，从神经网络到Transformer架构",
  },
  {
    category: "Education",
    text: "项目管理最佳实践：敏捷开发与Scrum框架",
  },
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
            key={example.text}
            className="welcome-example-card"
            onClick={() => handleExampleClick(example.text)}
          >
            <span className={`example-category-tag example-category-${example.category.toLowerCase()}`}>
              {example.category}
            </span>
            <span className="example-card-text">{example.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
