import { generateDeck } from "@opendeck/agent-core";
import {
  registerProvider,
  getProvider,
  listProviders as listRegisteredProviders,
} from "@opendeck/model-providers";
import type { TextModelProvider } from "@opendeck/model-providers";
import { parseRevisionCommand, applyRevisions } from "@opendeck/revision";
import type { Deck } from "@opendeck/slide-dsl";

// ---------------------------------------------------------------------------
// Pipeline-aware mock provider — returns schema-valid responses
// ---------------------------------------------------------------------------

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
      const slideCount = 6;
      const responses = [
        // 1. Intent
        JSON.stringify({
          intent: "generate_deck",
          confidence: 0.95,
          parameters: { purpose: "business_report" },
        }),
        // 2. Deck plan
        JSON.stringify({
          title: req.prompt.slice(0, 60) || "Presentation",
          purpose: "business_report",
          audience: "general",
          language: "zh",
          slideCount,
          slides: [
            { index: 0, type: "cover", layout: "hero_title", communicationGoal: "吸引注意力", mainMessage: req.prompt.slice(0, 40), keyPoints: ["开场"] },
            { index: 1, type: "agenda", layout: "title_content", communicationGoal: "概述内容", mainMessage: "目录概览", keyPoints: ["要点一", "要点二", "要点三"] },
            { index: 2, type: "insight", layout: "title_content", communicationGoal: "核心洞察", mainMessage: "关键发现", keyPoints: ["数据支撑", "趋势分析"] },
            { index: 3, type: "data_chart", layout: "chart_focus", communicationGoal: "数据展示", mainMessage: "数据趋势", keyPoints: ["图表分析"] },
            { index: 4, type: "comparison", layout: "two_column", communicationGoal: "对比分析", mainMessage: "方案对比", keyPoints: ["优势", "劣势"] },
            { index: 5, type: "closing", layout: "hero_title", communicationGoal: "总结收尾", mainMessage: "总结与展望", keyPoints: ["行动建议"] },
          ],
          theme: "bloomberg_dark",
        }),
      ];

      // 3+. Slide DSL responses
      for (let i = 0; i < slideCount; i++) {
        responses.push(JSON.stringify({
          id: `slide_${i}`,
          index: i,
          type: i === 0 ? "cover" : i === slideCount - 1 ? "closing" : i === 3 ? "data_chart" : "insight",
          layout: i === 0 ? "hero_title" : i === 3 ? "chart_focus" : "title_content",
          communicationGoal: `Goal ${i}`,
          mainMessage: `Message ${i}`,
          elements: [
            { id: `title_${i}`, type: "text", role: "title", content: i === 0 ? (req.prompt.slice(0, 40) || "Title") : `Slide ${i} Title`, editable: true },
            { id: `body_${i}`, type: "text", role: "body", content: `Content for slide ${i}. This slide covers key points about the topic.`, editable: true },
          ],
          speakerNote: `Speaker note for slide ${i}`,
        }));
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
// Register default providers at module load
// ---------------------------------------------------------------------------

registerProvider(createPipelineMockProvider());

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleGenerate(
  params: Record<string, unknown>
): Promise<unknown> {
  const prompt = params.prompt as string;
  if (!prompt) throw new Error("Missing required param: prompt");

  const providerName = (params.provider as string) || "mock";
  const provider = getProvider(providerName);
  if (!provider) throw new Error(`Provider "${providerName}" not found`);

  const deck = await generateDeck({
    prompt,
    provider,
    purpose: params.purpose as string | undefined,
    audience: params.audience as string | undefined,
    language: params.language as "zh" | "en" | "bilingual" | undefined,
    slideCount: params.slideCount as number | undefined,
    theme: params.theme as string | undefined,
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

  const provider = getProvider(name);
  if (!provider)
    return { available: false, reason: "Provider not registered" };

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
