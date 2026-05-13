import { generateDeck } from "@opendeck/agent-core";
import { OpenAIImageProvider, MockImageProvider } from "@opendeck/image-providers";
import type { ImageGenerationResult } from "@opendeck/image-providers";
import {
  registerProvider,
  getProvider,
  listProviders as listRegisteredProviders,
} from "@opendeck/model-providers";
import type { TextModelProvider } from "@opendeck/model-providers";
import { createOpenAICompatProvider } from "@opendeck/model-providers";
import { createAnthropicProvider } from "@opendeck/model-providers";
import { createGeminiProvider } from "@opendeck/model-providers";
import { createDeepSeekProvider } from "@opendeck/model-providers";
import { createKimiProvider } from "@opendeck/model-providers";
import { createQwenProvider } from "@opendeck/model-providers";
import { createGLMProvider } from "@opendeck/model-providers";
import { createMiniMaxProvider } from "@opendeck/model-providers";
import { createOpenRouterProvider } from "@opendeck/model-providers";
import { createLMStudioProvider } from "@opendeck/model-providers";
import { createVLLMProvider } from "@opendeck/model-providers";
import { parseRevisionCommand, applyRevisions } from "@opendeck/revision";
import type { Deck } from "@opendeck/slide-dsl";

// ---------------------------------------------------------------------------
// High-quality mock provider — generates realistic, data-driven content
// ---------------------------------------------------------------------------

function extractTopic(prompt: string): string {
  // Extract the core topic from the prompt
  const cleaned = prompt
    .replace(/[，。！？、；：""''【】《》（）\(\)\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 50) || "演示文稿";
}

function createPipelineMockProvider(): TextModelProvider {
  let callIndex = 0;

  return {
    id: "mock",
    name: "Mock Provider (Demo)",
    type: "local",
    supportsStreaming: false,
    supportsTools: false,
    supportsVision: false,

    async complete(req) {
      const topic = extractTopic(req.prompt);
      const slideCount = 8;

      // Generate rich, varied slide plans
      const slidePlans = [
        {
          index: 0, type: "cover", layout: "hero_title",
          communicationGoal: "开场吸引，建立主题认知",
          mainMessage: topic,
          keyPoints: ["核心主题", "关键洞察", "行动方向"],
          visualSuggestion: "hero image"
        },
        {
          index: 1, type: "agenda", layout: "grid_cards",
          communicationGoal: "概述演示结构，建立预期",
          mainMessage: "议程概览",
          keyPoints: ["背景与现状", "核心分析", "关键发现", "方案建议", "行动计划"],
        },
        {
          index: 2, type: "insight", layout: "big_number",
          communicationGoal: "用关键数据建立紧迫感",
          mainMessage: "核心指标揭示关键趋势",
          keyPoints: ["42% 年增长率", "市场规模达 $8.5B", "用户渗透率突破临界点"],
        },
        {
          index: 3, type: "problem", layout: "problem",
          communicationGoal: "清晰定义当前面临的挑战",
          mainMessage: "当前方案面临三大核心挑战",
          keyPoints: ["扩展性瓶颈", "成本结构不可持续", "用户体验碎片化"],
        },
        {
          index: 4, type: "data_chart", layout: "chart_focus",
          communicationGoal: "用数据支撑论点，增强可信度",
          mainMessage: "数据趋势显示明确的增长轨迹",
          keyPoints: ["季度环比增长", "市场份额变化", "用户活跃度趋势"],
          visualSuggestion: "bar chart with quarterly data"
        },
        {
          index: 5, type: "comparison", layout: "comparison_matrix",
          communicationGoal: "对比分析，帮助决策",
          mainMessage: "方案对比：综合评估各选项优劣",
          keyPoints: ["方案A：高投入高回报", "方案B：稳健保守", "方案C：创新突破"],
        },
        {
          index: 6, type: "solution", layout: "process_flow",
          communicationGoal: "提出清晰的解决方案路径",
          mainMessage: "三阶段实施路线图",
          keyPoints: ["第一阶段：基础建设（Q1-Q2）", "第二阶段：规模扩展（Q3-Q4）", "第三阶段：优化迭代（次年）"],
        },
        {
          index: 7, type: "closing", layout: "hero_title",
          communicationGoal: "总结要点，发出行动号召",
          mainMessage: "立即行动，抢占先机",
          keyPoints: ["核心结论", "下一步行动", "联系方式"],
        },
      ];

      const responses = [
        // 1. Intent
        JSON.stringify({
          intent: "generate_deck",
          confidence: 0.95,
          parameters: { purpose: "business_report" },
        }),
        // 2. Deck plan
        JSON.stringify({
          title: topic,
          purpose: "business_report",
          audience: "general",
          language: "zh",
          slideCount,
          slides: slidePlans,
          theme: "bloomberg_dark",
        }),
      ];

      // 3+. Slide DSL responses with rich, realistic content
      const slideContents = [
        // Slide 0: Cover
        {
          id: "slide_0", index: 0, type: "cover", layout: "hero_title",
          communicationGoal: "开场吸引", mainMessage: topic,
          elements: [
            { id: "title_0", type: "text", role: "title", content: topic, editable: true },
            { id: "subtitle_0", type: "text", role: "subtitle", content: "深度分析与战略建议", editable: true },
            { id: "date_0", type: "text", role: "caption", content: `2025年度 | 机密文件`, editable: true },
          ],
          speakerNote: "欢迎各位参加今天的演示。我们将深入分析当前市场态势，并提出切实可行的战略建议。",
        },
        // Slide 1: Agenda
        {
          id: "slide_1", index: 1, type: "agenda", layout: "grid_cards",
          communicationGoal: "概述结构", mainMessage: "议程概览",
          elements: [
            { id: "title_1", type: "text", role: "title", content: "议程", editable: true },
            { id: "item_1a", type: "text", role: "body", content: "01  背景与现状分析\n市场环境、竞争格局、核心挑战", editable: true },
            { id: "item_1b", type: "text", role: "body", content: "02  数据洞察\n关键指标、趋势分析、机会识别", editable: true },
            { id: "item_1c", type: "text", role: "body", content: "03  战略方案\n解决方案、实施路线、资源规划", editable: true },
            { id: "item_1d", type: "text", role: "body", content: "04  行动计划\n优先级、时间表、关键里程碑", editable: true },
          ],
          speakerNote: "今天的演示分为四个部分，预计用时30分钟。每个部分结束后欢迎提问。",
        },
        // Slide 2: Key Metric
        {
          id: "slide_2", index: 2, type: "insight", layout: "big_number",
          communicationGoal: "建立紧迫感", mainMessage: "核心指标",
          elements: [
            { id: "title_2", type: "text", role: "title", content: "关键指标揭示增长潜力", editable: true },
            { id: "metric_2", type: "text", role: "metric", content: "42%", editable: true },
            { id: "body_2", type: "text", role: "body", content: "年复合增长率（CAGR）\n市场规模预计从 $5.2B 增长至 $8.5B\n用户渗透率已达临界突破点", editable: true },
          ],
          speakerNote: "42%的年增长率远超行业平均水平。这表明我们正处于一个关键的市场窗口期。",
        },
        // Slide 3: Problem
        {
          id: "slide_3", index: 3, type: "problem", layout: "problem",
          communicationGoal: "定义挑战", mainMessage: "核心挑战",
          elements: [
            { id: "title_3", type: "text", role: "title", content: "当前方案面临三大核心挑战", editable: true },
            { id: "body_3a", type: "text", role: "body", content: "扩展性瓶颈\n现有架构无法支撑10x用户增长\n技术债务累积导致迭代速度下降40%", editable: true },
            { id: "body_3b", type: "text", role: "body", content: "成本结构不可持续\n获客成本（CAC）同比上升65%\n单位经济模型面临挑战", editable: true },
            { id: "body_3c", type: "text", role: "body", content: "用户体验碎片化\n跨平台一致性不足\nNPS评分从72下降至58", editable: true },
          ],
          speakerNote: "这三个挑战相互关联，如果不及时解决，将在未来12个月内显著影响业务表现。",
        },
        // Slide 4: Chart
        {
          id: "slide_4", index: 4, type: "data_chart", layout: "chart_focus",
          communicationGoal: "数据支撑", mainMessage: "增长趋势",
          elements: [
            { id: "title_4", type: "text", role: "title", content: "季度营收趋势与市场份额变化", editable: true },
            {
              id: "chart_4", type: "chart", chartType: "bar", role: "evidence",
              data: {
                categories: ["Q1'24", "Q2'24", "Q3'24", "Q4'24", "Q1'25"],
                series: [
                  { name: "营收 ($M)", values: [1.2, 1.5, 1.8, 2.1, 2.6] },
                  { name: "市场份额 (%)", values: [12, 14, 16, 18, 22] },
                ],
              },
              editable: false,
            },
            { id: "caption_4", type: "text", role: "caption", content: "数据来源：内部财务系统 & 第三方市场研究", editable: true },
          ],
          speakerNote: "营收连续5个季度保持环比增长，市场份额从12%提升至22%。Q1'25的加速增长主要得益于企业客户扩展。",
        },
        // Slide 5: Comparison
        {
          id: "slide_5", index: 5, type: "comparison", layout: "comparison_matrix",
          communicationGoal: "方案对比", mainMessage: "战略选项评估",
          elements: [
            { id: "title_5", type: "text", role: "title", content: "战略方案综合评估", editable: true },
            {
              id: "table_5", type: "table", role: "comparison",
              headers: ["评估维度", "方案A：全面升级", "方案B：渐进优化", "方案C：战略合作"],
              rows: [
                ["投入成本", "$2.5M", "$800K", "$1.2M"],
                ["预期回报", "180% ROI", "65% ROI", "120% ROI"],
                ["实施周期", "6-9个月", "3-6个月", "4-6个月"],
                ["风险等级", "高", "低", "中"],
                ["推荐指数", "★★★★★", "★★★☆☆", "★★★★☆"],
              ],
              editable: true,
            },
          ],
          speakerNote: "综合考虑投入产出比和风险因素，我们推荐方案A作为主路径，同时保留方案C作为补充。",
        },
        // Slide 6: Solution
        {
          id: "slide_6", index: 6, type: "solution", layout: "process_flow",
          communicationGoal: "解决方案", mainMessage: "实施路线图",
          elements: [
            { id: "title_6", type: "text", role: "title", content: "三阶段实施路线图", editable: true },
            { id: "step_1", type: "text", role: "body", content: "第一阶段\n基础建设\nQ1-Q2\n架构重构 + 团队组建", editable: true },
            { id: "step_2", type: "text", role: "body", content: "第二阶段\n规模扩展\nQ3-Q4\n产品发布 + 市场推广", editable: true },
            { id: "step_3", type: "text", role: "body", content: "第三阶段\n优化迭代\n次年\n数据驱动 + 持续改进", editable: true },
          ],
          speakerNote: "每个阶段都有明确的交付物和里程碑。第一阶段的成功是后续阶段的基础。",
        },
        // Slide 7: Closing
        {
          id: "slide_7", index: 7, type: "closing", layout: "hero_title",
          communicationGoal: "行动号召", mainMessage: "立即行动",
          elements: [
            { id: "title_7", type: "text", role: "title", content: "立即行动，抢占市场先机", editable: true },
            { id: "subtitle_7", type: "text", role: "subtitle", content: "时间窗口有限，机会稍纵即逝", editable: true },
            { id: "body_7", type: "text", role: "body", content: "核心结论\n1. 市场正处于爆发前夜，先发优势至关重要\n2. 方案A综合回报最高，建议立即启动\n3. 首批资源投入 $2.5M，预期18个月内收回\n\n下一步行动\n• 本周内完成方案A详细规划\n• 两周内启动团队组建\n• 一个月内完成技术架构评审", editable: true },
          ],
          speakerNote: "感谢各位的时间。我们相信，通过果断行动，可以在未来18个月内建立显著的竞争优势。期待与各位共同推进这一战略。",
        },
      ];

      for (const slide of slideContents) {
        responses.push(JSON.stringify(slide));
      }

      const response = responses[callIndex] ?? '{"intent":"ask_question","confidence":0.5,"parameters":{}}';
      callIndex++;
      return {
        content: response,
        usage: { inputTokens: 100, outputTokens: 200 },
        finishReason: "stop",
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Register default providers
// ---------------------------------------------------------------------------

registerProvider(createPipelineMockProvider());

// ---------------------------------------------------------------------------
// Dynamic provider creation from config
// ---------------------------------------------------------------------------

function resolveProvider(params: Record<string, unknown>): TextModelProvider {
  const providerName = (params.provider as string) || "mock";

  // Already registered (e.g. mock)
  const existing = getProvider(providerName);
  if (existing) return existing;

  // Dynamic creation based on provider type
  const apiKey = (params.apiKey as string) || "";
  const baseUrl = (params.baseUrl as string) || "";
  const model = (params.model as string) || "";

  let provider: TextModelProvider;

  switch (providerName) {
    case "openai": {
      provider = createOpenAICompatProvider({ apiKey, baseUrl, model });
      break;
    }
    case "anthropic": {
      provider = createAnthropicProvider({ apiKey, baseUrl, model });
      break;
    }
    case "gemini": {
      provider = createGeminiProvider({ apiKey, baseUrl, model });
      break;
    }
    case "deepseek": {
      provider = createDeepSeekProvider({ apiKey, baseUrl, model });
      break;
    }
    case "kimi": {
      provider = createKimiProvider({ apiKey, baseUrl, model });
      break;
    }
    case "qwen": {
      provider = createQwenProvider({ apiKey, baseUrl, model });
      break;
    }
    case "glm-domestic": {
      provider = createGLMProvider({ apiKey, baseUrl, model, region: "domestic" });
      break;
    }
    case "glm-international": {
      provider = createGLMProvider({ apiKey, baseUrl, model, region: "international" });
      break;
    }
    case "minimax-domestic": {
      provider = createMiniMaxProvider({ apiKey, baseUrl, model, region: "domestic" });
      break;
    }
    case "minimax-international": {
      provider = createMiniMaxProvider({ apiKey, baseUrl, model, region: "international" });
      break;
    }
    case "openrouter": {
      provider = createOpenRouterProvider({ apiKey, baseUrl, model });
      break;
    }
    case "lmstudio": {
      provider = createLMStudioProvider({ baseUrl, model });
      break;
    }
    case "vllm": {
      provider = createVLLMProvider({ apiKey, baseUrl, model });
      break;
    }
    default:
      throw new Error(`Unknown provider: "${providerName}". Available: mock, ollama, openai, anthropic, gemini, deepseek, kimi, qwen, glm-domestic, glm-international, minimax-domestic, minimax-international, openrouter, lmstudio, vllm`);
  }

  registerProvider(provider);
  return provider;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleGenerate(
  params: Record<string, unknown>
): Promise<unknown> {
  const prompt = params.prompt as string;
  if (!prompt) throw new Error("Missing required param: prompt");

  const provider = resolveProvider(params);

  // Progress callback writes JSON lines to stderr for the Rust host to forward
  const onProgress = (step: string, detail?: string) => {
    try {
      const msg = JSON.stringify({ type: "progress", step, detail }) + "\n";
      process.stderr.write(msg);
    } catch {
      // Stderr write failures are non-fatal
    }
  };

  const deck = await generateDeck({
    prompt,
    provider,
    purpose: params.purpose as string | undefined,
    audience: params.audience as string | undefined,
    language: params.language as "zh" | "en" | "bilingual" | undefined,
    slideCount: params.slideCount as number | undefined,
    theme: params.theme as string | undefined,
    qualityLoop: params.qualityLoop as boolean | undefined,
    minQualityScore: params.minQualityScore as number | undefined,
    onProgress,
  });

  return { deck };
}

export async function handleModify(
  params: Record<string, unknown>
): Promise<unknown> {
  const deck = params.deck as Deck;
  const command = params.command as string;
  if (!deck) throw new Error("Missing required param: deck");
  if (!command) throw new Error("Missing required param: command");

  const actions = parseRevisionCommand(command);
  if (actions.length === 0)
    throw new Error(`Could not parse revision command: ${command}`);

  const result = applyRevisions(deck, actions);
  if (!result.success)
    throw new Error(`Revision failed: ${result.errors?.join(", ")}`);

  return { deck: result.deck as Deck };
}

export async function handleCheckProvider(
  params: Record<string, unknown>
): Promise<unknown> {
  const name = params.name as string;
  if (!name) throw new Error("Missing required param: name");

  // Try existing or dynamically create the provider for checking
  let provider = getProvider(name);
  if (!provider) {
    try {
      provider = resolveProvider({ provider: name, ...params });
    } catch {
      return { available: false, reason: "Provider not recognized" };
    }
  }

  try {
    await provider.complete({ prompt: "ping", maxTokens: 5 });
    return { available: true };
  } catch (err: unknown) {
    return {
      available: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function handleListProviders(): Promise<unknown> {
  const providers = listRegisteredProviders();
  return { providers: providers.map((p) => p.id) };
}

// ── Image Generation ──

export async function handleGenerateImage(
  params: Record<string, unknown>
): Promise<unknown> {
  const prompt = params.prompt as string;
  if (!prompt) throw new Error("Missing required param: prompt");

  const provider = (params.imageProvider as string) || "openai";
  const apiKey = (params.apiKey as string) || "";
  const model = params.model as string | undefined;
  const width = (params.width as number) || 1024;
  const height = (params.height as number) || 1024;
  const style = params.style as string | undefined;

  let result: ImageGenerationResult;

  if (provider === "mock") {
    const mock = new MockImageProvider();
    result = await mock.generate({ prompt, width, height });
  } else {
    if (!apiKey) throw new Error("API key required for image generation");
    const openai = new OpenAIImageProvider({
      apiKey,
      model: model ?? "dall-e-3",
    });
    result = await openai.generate({
      prompt,
      width,
      height,
      style: style as "natural" | "artistic" | "photographic" | "illustration" | undefined,
    });
  }

  return {
    base64: result.base64,
    url: result.url,
    revisedPrompt: result.revisedPrompt,
    metadata: result.metadata,
  };
}
