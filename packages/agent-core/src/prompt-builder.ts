const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a presentation (slide deck) generation system.
Analyze the user's message and determine what they want to do.

Supported intents:
- generate_deck: Create a new presentation from scratch
- modify_deck: Change overall deck properties
- modify_slide: Change a specific slide
- change_style: Change the visual theme/style
- change_audience: Adjust content for a different audience
- compress_deck: Reduce the number of slides or content
- expand_deck: Add more slides or detail
- add_slide: Insert a new slide
- delete_slide: Remove a slide
- rewrite_content: Rewrite text on existing slides
- generate_speaker_notes: Add speaker notes to slides
- generate_visual_assets: Create or find images/diagrams
- replace_image: Replace an image on a slide
- export_file: Export the deck to a file
- ask_question: General question about the deck or presentation

Return a JSON object with:
- intent: one of the above
- confidence: 0.0 to 1.0
- parameters: any extracted parameters (topic, slide number, style, etc.)
`;

export function buildIntentPrompt(
  userMessage: string,
  projectState?: { title?: string; slideCount?: number; theme?: string }
): { systemPrompt: string; userPrompt: string } {
  let context = "";
  if (projectState) {
    const parts: string[] = [];
    if (projectState.title) parts.push(`Current deck title: "${projectState.title}"`);
    if (projectState.slideCount !== undefined)
      parts.push(`Current slide count: ${projectState.slideCount}`);
    if (projectState.theme) parts.push(`Current theme: ${projectState.theme}`);
    if (parts.length > 0) {
      context = `\n\nCurrent project state:\n${parts.join("\n")}`;
    }
  }

  return {
    systemPrompt: INTENT_SYSTEM_PROMPT,
    userPrompt: `User message: "${userMessage}"${context}`,
  };
}

const DECK_PLAN_SYSTEM_PROMPT = `You are a presentation structure planner. Given a topic and requirements, create a detailed slide-by-slide plan for a professional presentation.

For each slide, specify:
- index: slide number (0-based)
- type: one of cover, agenda, section_divider, insight, problem, solution, comparison, timeline, process, data_chart, case_study, quote, summary, closing, appendix
- layout: one of hero_title, title_content, two_column, three_column, big_number, comparison_matrix, timeline_horizontal, timeline_vertical, process_flow, image_left_text_right, image_right_text_left, full_bleed_image, chart_focus, quote_focus, grid_cards, consulting_summary
- communicationGoal: what this slide should communicate
- mainMessage: the single key message of this slide
- keyPoints: 2-5 supporting points
- visualSuggestion: optional suggestion for visuals

Return a JSON object with:
- title: the deck title
- purpose: the deck purpose
- audience: target audience
- language: "zh", "en", or "bilingual"
- slideCount: total number of slides
- slides: array of slide plans
- theme: suggested theme style
`;

export function buildDeckPlanPrompt(
  topic: string,
  purpose: string,
  audience: string,
  slideCount: number
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: DECK_PLAN_SYSTEM_PROMPT,
    userPrompt: [
      `Topic: ${topic}`,
      `Purpose: ${purpose}`,
      `Target audience: ${audience}`,
      `Desired slide count: ${slideCount}`,
      "",
      "Create a detailed slide-by-slide plan for this presentation.",
    ].join("\n"),
  };
}

const SLIDE_GENERATION_SYSTEM_PROMPT = `You are a slide content generator. Given a slide plan and theme specification, generate the complete Slide DSL JSON for a single slide.

The slide must include:
- id: a unique string identifier
- index: the slide number
- type: the slide type
- layout: the layout type
- communicationGoal: what the slide communicates
- mainMessage: the key message
- elements: array of slide elements (text, image, table, chart, etc.)
- speakerNote: optional speaker notes

Each text element must have:
- id: unique string
- type: "text"
- role: one of title, subtitle, headline, body, caption, label, metric, footnote
- content: the text content
- editable: true

Return a single slide JSON object (not an array).`;

export function buildSlidePrompt(
  slidePlan: {
    index: number;
    type: string;
    layout: string;
    communicationGoal: string;
    mainMessage: string;
    keyPoints: string[];
    visualSuggestion?: string;
  },
  themeSpec?: {
    id: string;
    name: string;
    style: string;
    colors?: Record<string, unknown>;
  }
): { systemPrompt: string; userPrompt: string } {
  const planJson = JSON.stringify(slidePlan, null, 2);
  const themeJson = themeSpec ? JSON.stringify(themeSpec, null, 2) : "default";

  return {
    systemPrompt: SLIDE_GENERATION_SYSTEM_PROMPT,
    userPrompt: [
      "Slide plan:",
      "```json",
      planJson,
      "```",
      "",
      `Theme: ${themeJson}`,
      "",
      "Generate the complete Slide DSL JSON for this slide.",
    ].join("\n"),
  };
}

const REVISION_SYSTEM_PROMPT = `You are a slide revision assistant. Given the current slide content and a user's modification command, produce the updated slide JSON.

Maintain the same structure and element IDs. Only change what the user requests.
Return the complete updated slide JSON.`;

export function buildRevisionPrompt(
  currentSlide: Record<string, unknown>,
  userCommand: string
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: REVISION_SYSTEM_PROMPT,
    userPrompt: [
      "Current slide:",
      "```json",
      JSON.stringify(currentSlide, null, 2),
      "```",
      "",
      `User command: "${userCommand}"`,
      "",
      "Return the updated slide JSON.",
    ].join("\n"),
  };
}
