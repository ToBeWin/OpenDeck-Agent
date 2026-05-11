import type { RevisionAction } from "./types";

/**
 * Parses natural language revision commands into RevisionActions.
 *
 * Supported patterns:
 *   "add a slide after slide 3"        -> add_slide
 *   "delete slide 5"                   -> remove_slide
 *   "remove slide 5"                   -> remove_slide
 *   "move slide 2 to position 4"       -> move_slide
 *   "change the title to X"            -> change_title
 *   "set title to X"                   -> change_title
 *   "change theme to dark"             -> change_theme
 *   "set theme to dark"                -> change_theme
 *   "replace the text on slide 3"      -> update_slide
 *   "change language to en"            -> change_language
 *   "set language to en"               -> change_language
 *
 * Returns an array of parsed actions (may be empty if unparseable).
 */
export function parseRevisionCommand(command: string): RevisionAction[] {
  const text = command.trim().toLowerCase();
  const actions: RevisionAction[] = [];

  // ── change title ──────────────────────────────────────────────────────
  const titleMatch = text.match(
    /(?:change|set|update)\s+(?:the\s+)?title\s+(?:to|:)\s+(.+)/i,
  );
  if (titleMatch) {
    actions.push({ action: "change_title", title: titleMatch[1].trim() });
    return actions;
  }

  // ── change theme ──────────────────────────────────────────────────────
  const themeMatch = text.match(
    /(?:change|set|switch)\s+(?:the\s+)?theme\s+(?:to|:)\s+(.+)/i,
  );
  if (themeMatch) {
    actions.push({ action: "change_theme", theme: themeMatch[1].trim() });
    return actions;
  }

  // ── change language ───────────────────────────────────────────────────
  const langMatch = text.match(
    /(?:change|set|switch)\s+(?:the\s+)?language\s+(?:to|:)\s+(.+)/i,
  );
  if (langMatch) {
    actions.push({
      action: "change_language",
      language: langMatch[1].trim(),
    });
    return actions;
  }

  // ── add slide ─────────────────────────────────────────────────────────
  const addMatch = text.match(
    /add\s+(?:a\s+)?(?:new\s+)?slide\s*(?:(?:after|at|before)\s+(?:slide\s+)?(\d+))?/i,
  );
  if (addMatch) {
    const indexStr = addMatch[1];
    actions.push({
      action: "add_slide",
      index: indexStr ? Number(indexStr) : undefined,
      slide: { type: "insight", layout: "title_content" },
    });
    return actions;
  }

  // ── remove slide ──────────────────────────────────────────────────────
  const removeMatch = text.match(
    /(?:delete|remove)\s+(?:slide\s+)?(\d+)/i,
  );
  if (removeMatch) {
    actions.push({ action: "remove_slide", index: Number(removeMatch[1]) });
    return actions;
  }

  // ── move slide ────────────────────────────────────────────────────────
  const moveMatch = text.match(
    /move\s+(?:slide\s+)?(\d+)\s+(?:to\s+)?(?:position\s+)?(\d+)/i,
  );
  if (moveMatch) {
    actions.push({
      action: "move_slide",
      from: Number(moveMatch[1]),
      to: Number(moveMatch[2]),
    });
    return actions;
  }

  // ── update slide (generic replacement hint) ───────────────────────────
  const updateMatch = text.match(
    /(?:replace|update)\s+(?:the\s+)?(?:text|content)\s+(?:on|of)\s+(?:slide\s+)?(\d+)/i,
  );
  if (updateMatch) {
    actions.push({
      action: "update_slide",
      index: Number(updateMatch[1]),
      patch: {},
    });
    return actions;
  }

  return actions;
}
