import type { Deck } from "@opendeck/slide-dsl";
import type { RevisionAction, RevisionHistory } from "./types";

interface HistoryEntry {
  deck: Deck;
  actions: RevisionAction[];
  timestamp: string;
  description?: string;
}

/**
 * Undo / redo stack for deck revisions.
 *
 * Usage:
 *   const history = new VersionHistory();
 *   history.push(deck, [], "initial");
 *   history.push(modifiedDeck, actions, "added a slide");
 *   const previous = history.undo();   // returns original deck
 *   const restored = history.redo();   // returns modified deck again
 */
export class VersionHistory {
  private entries: HistoryEntry[] = [];
  private cursor = -1; // points at the current entry
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Push a new snapshot. Any redo entries beyond the cursor are discarded.
   */
  push(
    deck: Deck,
    actions: RevisionAction[],
    description?: string,
  ): void {
    // Drop everything after cursor (invalidates redo stack)
    this.entries = this.entries.slice(0, this.cursor + 1);

    this.entries.push({
      deck: JSON.parse(JSON.stringify(deck)),
      actions,
      timestamp: new Date().toISOString(),
      description,
    });

    // Enforce max size by trimming from the front
    if (this.entries.length > this.maxSize) {
      this.entries = this.entries.slice(this.entries.length - this.maxSize);
    }

    this.cursor = this.entries.length - 1;
  }

  /**
   * Move back one step and return the deck snapshot.
   * Returns undefined if already at the beginning.
   */
  undo(): Deck | undefined {
    if (this.cursor <= 0) return undefined;
    this.cursor--;
    return JSON.parse(JSON.stringify(this.entries[this.cursor].deck));
  }

  /**
   * Move forward one step and return the deck snapshot.
   * Returns undefined if already at the latest entry.
   */
  redo(): Deck | undefined {
    if (this.cursor >= this.entries.length - 1) return undefined;
    this.cursor++;
    return JSON.parse(JSON.stringify(this.entries[this.cursor].deck));
  }

  /**
   * Return the deck at the current cursor position without moving.
   */
  current(): Deck | undefined {
    if (this.cursor < 0 || this.cursor >= this.entries.length)
      return undefined;
    return JSON.parse(JSON.stringify(this.entries[this.cursor].deck));
  }

  /**
   * Return the full history log (all entries, not just up to cursor).
   */
  getHistory(): RevisionHistory[] {
    return this.entries.map((e) => ({
      actions: e.actions,
      timestamp: e.timestamp,
      description: e.description,
    }));
  }

  /**
   * Clear all history.
   */
  clear(): void {
    this.entries = [];
    this.cursor = -1;
  }
}
