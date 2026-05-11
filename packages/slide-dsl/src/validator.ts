import { deckSchema } from "./schemas";
import type { Deck } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  deck?: Deck;
}

export function validateDeck(data: unknown): ValidationResult {
  const result = deckSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [], deck: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`
    ),
  };
}
