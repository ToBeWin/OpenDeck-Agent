const INTENT_SYSTEM_PROMPT = `You are an expert intent classifier for a presentation generation system.
Analyze the user's message and determine their intent with high accuracy.

Supported intents:
- generate_deck: Create a new presentation from scratch
- modify_deck: Change overall deck properties (title, theme, language)
- modify_slide: Change a specific slide's content or layout
- change_style: Change the visual theme/style
- change_audience: Adjust content for a different audience
- compress_deck: Reduce slides or content density
- expand_deck: Add more slides or detail
- add_slide: Insert a new slide at a specific position
- delete_slide: Remove a slide
- rewrite_content: Rewrite text on existing slides
- generate_speaker_notes: Add speaker notes to slides
- generate_visual_assets: Create or find images/diagrams
- replace_image: Replace an image on a slide
- export_file: Export the deck to a file
- ask_question: General question about presentations

Return JSON: { intent, confidence, parameters }`;

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

const DECK_PLAN_SYSTEM_PROMPT = `You are a world-class presentation strategist. Given a topic, create a compelling slide-by-slide plan that tells a story.

## Design Principles
1. **Story arc**: Opening hook → Context → Key insights → Evidence → Solutions → Call to action
2. **Cognitive load**: One key message per slide. Don't overload.
3. **Visual variety**: Use different layouts across slides. Never repeat the same layout 3+ times consecutively.
4. **Data-driven**: Include at least 1-2 data/chart slides for credibility.
5. **Emotional rhythm**: Alternate between analytical slides and emotional/visual slides.

## Available Slide Types
cover, agenda, section_divider, insight, problem, solution, comparison, timeline, process, data_chart, case_study, quote, summary, closing, appendix

## Available Layouts
hero_title, title_content, two_column, three_column, big_number, comparison_matrix, timeline_horizontal, timeline_vertical, process_flow, image_left_text_right, image_right_text_left, full_bleed_image, chart_focus, quote_focus, grid_cards, consulting_summary, section_divider, problem, solution, case_study, quote, summary

## Layout Selection Guide
- **cover**: hero_title or full_bleed_image
- **agenda**: title_content or grid_cards
- **insight**: big_number (for key metric) or title_content
- **data_chart**: chart_focus (with actual data)
- **comparison**: two_column or comparison_matrix
- **timeline**: timeline_horizontal or timeline_vertical
- **process**: process_flow (3-5 steps)
- **problem/solution**: problem or solution layout
- **case_study**: case_study (challenge/approach/result)
- **quote**: quote or quote_focus
- **summary**: summary or consulting_summary
- **closing**: hero_title

## Content Quality Rules
- Titles must be specific and compelling, NOT generic ("Q3 Revenue Growth: 47% YoY" not "Financial Data")
- Key points must be concrete with numbers, names, or specific details
- Each slide's mainMessage should be a complete insight, not a topic
- Include speaker notes that add context beyond what's on the slide

Return JSON with: title, purpose, audience, language, slideCount, slides[], theme`;

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
      "Create a compelling, story-driven slide plan. Be specific with titles and key messages.",
      "Each slide should have a clear communication goal and concrete content, not generic placeholders.",
    ].join("\n"),
  };
}

const SLIDE_GENERATION_SYSTEM_PROMPT = `You are an expert slide content writer. Generate complete, production-ready Slide DSL JSON for a single slide.

## Content Quality Standards
1. **Titles**: Specific, compelling, 5-15 words. "Q3 Revenue Reached $4.2M, Up 47% YoY" NOT "Revenue Data"
2. **Body text**: Concrete sentences with data. "Our ARR grew from $2.1M to $3.1M, driven by enterprise expansion" NOT "Revenue increased"
3. **Charts**: Include realistic data with meaningful categories and values
4. **Tables**: Include actual comparative data, not placeholders
5. **Speaker notes**: Add 2-3 sentences of context that isn't on the slide

## Element Types
- **text**: id, type:"text", role (title/subtitle/headline/body/caption/label/metric/footnote), content, editable:true
- **chart**: id, type:"chart", chartType (bar/line/pie/area/scatter/combo), role (evidence/trend/comparison/breakdown), data:{categories, series:[{name, values}]}, editable:false
- **table**: id, type:"table", role (comparison/data/summary/pricing/roadmap), headers:[], rows:[[]], editable:true
- **image**: id, type:"image", role (hero/background/illustration/supporting), source:"placeholder", sourceType:"generated", editable:false

## Layout-specific Rules
- hero_title: title (large) + subtitle + optional body
- big_number: title + metric (large number) + body (explanation)
- two_column: title + 2 body elements (left/right)
- chart_focus: title + chart element + optional caption
- comparison_matrix: title + multiple label/body pairs
- timeline_horizontal: title + timeline items as body elements
- process_flow: title + 3-5 process steps as body elements
- quote: large italic quote text + attribution as subtitle

Return a SINGLE slide JSON object (not an array). Include 2-6 elements per slide.`;

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
      "## Slide Plan",
      "```json",
      planJson,
      "```",
      "",
      `## Theme: ${themeJson}`,
      "",
      "Generate production-quality slide content. Be specific and data-driven.",
      "Do NOT use placeholder text. Write as if this will be presented to a real audience.",
    ].join("\n"),
  };
}

const REVISION_SYSTEM_PROMPT = `You are a presentation editor. Given the current slide and a modification command, produce the updated slide JSON.

Rules:
- Maintain the same structure and element IDs
- Only change what the user requests
- Preserve the overall quality and consistency
- If adding content, make it specific and relevant
- Return the complete updated slide JSON`;

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
      `Modification: "${userCommand}"`,
      "",
      "Return the updated slide JSON.",
    ].join("\n"),
  };
}
