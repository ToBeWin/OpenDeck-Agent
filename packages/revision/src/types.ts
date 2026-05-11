import { z } from "zod";

export const RevisionActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add_slide"),
    index: z.number().optional(),
    slide: z.object({
      type: z.string(),
      layout: z.string(),
      mainMessage: z.string().optional(),
      communicationGoal: z.string().optional(),
    }),
  }),
  z.object({
    action: z.literal("remove_slide"),
    index: z.number(),
  }),
  z.object({
    action: z.literal("move_slide"),
    from: z.number(),
    to: z.number(),
  }),
  z.object({
    action: z.literal("update_slide"),
    index: z.number(),
    patch: z.record(z.unknown()),
  }),
  z.object({
    action: z.literal("add_element"),
    slideIndex: z.number(),
    element: z.record(z.unknown()),
  }),
  z.object({
    action: z.literal("remove_element"),
    slideIndex: z.number(),
    elementId: z.string(),
  }),
  z.object({
    action: z.literal("update_element"),
    slideIndex: z.number(),
    elementId: z.string(),
    patch: z.record(z.unknown()),
  }),
  z.object({
    action: z.literal("change_theme"),
    theme: z.string(),
  }),
  z.object({
    action: z.literal("change_title"),
    title: z.string(),
  }),
  z.object({
    action: z.literal("change_language"),
    language: z.string(),
  }),
]);

export type RevisionAction = z.infer<typeof RevisionActionSchema>;

export interface RevisionResult {
  success: boolean;
  deck: unknown; // The modified deck
  errors?: string[];
}

export interface RevisionHistory {
  actions: RevisionAction[];
  timestamp: string;
  description?: string;
}
