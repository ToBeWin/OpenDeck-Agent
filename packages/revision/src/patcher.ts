import type { Deck, Slide, SlideElement } from "@opendeck/slide-dsl";
import type { RevisionAction, RevisionResult } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────

function cloneDeck(deck: Deck): Deck {
  return JSON.parse(JSON.stringify(deck));
}

function errorResult(errors: string[]): RevisionResult {
  return { success: false, deck: null as unknown as Deck, errors };
}

function okResult(deck: Deck): RevisionResult {
  return { success: true, deck };
}

// ─── Single action ────────────────────────────────────────────────────────

function applyOne(deck: Deck, action: RevisionAction): RevisionResult {
  switch (action.action) {
    // ── add_slide ──────────────────────────────────────────────────────
    case "add_slide": {
      const idx = action.index ?? deck.slides.length;
      if (idx < 0 || idx > deck.slides.length) {
        return errorResult([
          `add_slide: index ${idx} is out of range [0..${deck.slides.length}]`,
        ]);
      }
      const newSlide: Slide = {
        id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        index: idx,
        type: (action.slide.type as Slide["type"]) ?? "insight",
        layout: (action.slide.layout as Slide["layout"]) ?? "title_content",
        communicationGoal: action.slide.communicationGoal ?? "",
        mainMessage: action.slide.mainMessage ?? "",
        elements: [],
      };
      deck.slides.splice(idx, 0, newSlide);
      reindexSlides(deck);
      return okResult(deck);
    }

    // ── remove_slide ──────────────────────────────────────────────────
    case "remove_slide": {
      const { index } = action;
      if (index < 0 || index >= deck.slides.length) {
        return errorResult([
          `remove_slide: index ${index} is out of range [0..${deck.slides.length - 1}]`,
        ]);
      }
      deck.slides.splice(index, 1);
      reindexSlides(deck);
      return okResult(deck);
    }

    // ── move_slide ────────────────────────────────────────────────────
    case "move_slide": {
      const { from, to } = action;
      if (from < 0 || from >= deck.slides.length) {
        return errorResult([
          `move_slide: from index ${from} is out of range`,
        ]);
      }
      if (to < 0 || to >= deck.slides.length) {
        return errorResult([`move_slide: to index ${to} is out of range`]);
      }
      const [moved] = deck.slides.splice(from, 1);
      deck.slides.splice(to, 0, moved);
      reindexSlides(deck);
      return okResult(deck);
    }

    // ── update_slide ──────────────────────────────────────────────────
    case "update_slide": {
      const { index, patch } = action;
      if (index < 0 || index >= deck.slides.length) {
        return errorResult([
          `update_slide: index ${index} is out of range`,
        ]);
      }
      const slide = deck.slides[index];
      for (const [key, value] of Object.entries(patch)) {
        (slide as Record<string, unknown>)[key] = value;
      }
      return okResult(deck);
    }

    // ── add_element ───────────────────────────────────────────────────
    case "add_element": {
      const { slideIndex, element } = action;
      if (slideIndex < 0 || slideIndex >= deck.slides.length) {
        return errorResult([
          `add_element: slideIndex ${slideIndex} is out of range`,
        ]);
      }
      deck.slides[slideIndex].elements.push(element as unknown as SlideElement);
      return okResult(deck);
    }

    // ── remove_element ────────────────────────────────────────────────
    case "remove_element": {
      const { slideIndex, elementId } = action;
      if (slideIndex < 0 || slideIndex >= deck.slides.length) {
        return errorResult([
          `remove_element: slideIndex ${slideIndex} is out of range`,
        ]);
      }
      const elements = deck.slides[slideIndex].elements;
      const elIdx = elements.findIndex((el) => el.id === elementId);
      if (elIdx === -1) {
        return errorResult([
          `remove_element: element "${elementId}" not found on slide ${slideIndex}`,
        ]);
      }
      elements.splice(elIdx, 1);
      return okResult(deck);
    }

    // ── update_element ────────────────────────────────────────────────
    case "update_element": {
      const { slideIndex, elementId, patch } = action;
      if (slideIndex < 0 || slideIndex >= deck.slides.length) {
        return errorResult([
          `update_element: slideIndex ${slideIndex} is out of range`,
        ]);
      }
      const elements = deck.slides[slideIndex].elements;
      const el = elements.find((e) => e.id === elementId);
      if (!el) {
        return errorResult([
          `update_element: element "${elementId}" not found on slide ${slideIndex}`,
        ]);
      }
      for (const [key, value] of Object.entries(patch)) {
        (el as Record<string, unknown>)[key] = value;
      }
      return okResult(deck);
    }

    // ── change_theme ──────────────────────────────────────────────────
    case "change_theme": {
      // Store the requested theme name on the theme object.
      // Full theme resolution is left to downstream consumers.
      deck.theme.name = action.theme;
      return okResult(deck);
    }

    // ── change_title ──────────────────────────────────────────────────
    case "change_title": {
      deck.title = action.title;
      return okResult(deck);
    }

    // ── change_language ───────────────────────────────────────────────
    case "change_language": {
      const lang = action.language;
      if (lang !== "zh" && lang !== "en" && lang !== "bilingual") {
        return errorResult([
          `change_language: "${lang}" is not a valid language (zh | en | bilingual)`,
        ]);
      }
      deck.language = lang;
      return okResult(deck);
    }
  }
}

// ─── Re-index slides after structural changes ─────────────────────────────

function reindexSlides(deck: Deck): void {
  for (let i = 0; i < deck.slides.length; i++) {
    deck.slides[i].index = i;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Apply a single revision action to a deck.
 * The input deck is **not** mutated; a deep clone is returned on success.
 */
export function applyRevision(
  deck: Deck,
  action: RevisionAction,
): RevisionResult {
  const copy = cloneDeck(deck);
  return applyOne(copy, action);
}

/**
 * Apply a sequence of revision actions to a deck.
 * Each action operates on the result of the previous one.
 * Stops early if any action fails.
 */
export function applyRevisions(
  deck: Deck,
  actions: RevisionAction[],
): RevisionResult {
  let current = cloneDeck(deck);
  for (const action of actions) {
    const result = applyOne(current, action);
    if (!result.success) {
      return result;
    }
    current = result.deck as Deck;
  }
  return okResult(current);
}
