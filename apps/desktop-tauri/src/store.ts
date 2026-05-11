import { create } from "zustand";
import type { DeckData } from "./types";
import { sampleDeck } from "./data/sample-deck";

interface AppState {
  deck: DeckData | null;
  currentSlideIndex: number;
  loading: boolean;
  error: string | null;
  commandBarOpen: boolean;
  commandHistory: string[];

  setDeck: (deck: DeckData) => void;
  setCurrentSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCommandBar: () => void;
  addCommand: (cmd: string) => void;
  loadSampleDeck: () => void;
  generatePptx: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  deck: null,
  currentSlideIndex: 0,
  loading: false,
  error: null,
  commandBarOpen: false,
  commandHistory: [],

  setDeck: (deck) => set({ deck, currentSlideIndex: 0, error: null }),

  setCurrentSlide: (index) => {
    const { deck } = get();
    if (deck && index >= 0 && index < deck.slides.length) {
      set({ currentSlideIndex: index });
    }
  },

  nextSlide: () => {
    const { deck, currentSlideIndex } = get();
    if (deck && currentSlideIndex < deck.slides.length - 1) {
      set({ currentSlideIndex: currentSlideIndex + 1 });
    }
  },

  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1 });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  toggleCommandBar: () => set((s) => ({ commandBarOpen: !s.commandBarOpen })),

  addCommand: (cmd) =>
    set((s) => ({
      commandHistory: [cmd, ...s.commandHistory].slice(0, 20),
    })),

  loadSampleDeck: () => {
    set({ deck: sampleDeck, currentSlideIndex: 0, error: null });
  },

  generatePptx: async () => {
    set({ loading: true, error: null });
    try {
      const { generateTestPptx } = await import("./lib/tauri");
      await generateTestPptx();
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
}));
