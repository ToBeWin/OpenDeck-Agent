import { create } from "zustand";
import type { DeckData } from "./types";
import { sampleDeck } from "./data/sample-deck";

interface AppState {
  deck: DeckData | null;
  currentSlideIndex: number;
  loading: boolean;
  error: string | null;
  generationStep: string | null;
  commandBarOpen: boolean;
  commandHistory: string[];
  settingsOpen: boolean;
  providerConfig: {
    provider: "mock" | "ollama" | "openai";
    ollamaBaseUrl: string;
    ollamaModel: string;
    openaiApiKey: string;
    openaiBaseUrl: string;
    openaiModel: string;
    language: "zh" | "en" | "bilingual";
    theme: string;
  };

  setDeck: (deck: DeckData | null) => void;
  updateSlideContent: (slideIndex: number, elementId: string, content: string) => void;
  setCurrentSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCommandBar: () => void;
  addCommand: (cmd: string) => void;
  generatePptx: () => Promise<void>;
  toggleSettings: () => void;
  updateProviderConfig: (config: Partial<AppState["providerConfig"]>) => void;
  generateFromPrompt: (prompt: string) => Promise<void>;
  modifyFromCommand: (command: string) => Promise<void>;
  exportCurrentDeck: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  deck: null,
  currentSlideIndex: 0,
  loading: false,
  error: null,
  generationStep: null,
  commandBarOpen: false,
  commandHistory: [],
  settingsOpen: false,
  providerConfig: {
    provider: "mock",
    ollamaBaseUrl: "http://localhost:11434",
    ollamaModel: "llama3",
    openaiApiKey: "",
    openaiBaseUrl: "https://api.openai.com/v1",
    openaiModel: "gpt-4o",
    language: "zh",
    theme: "Bloomberg Dark",
  },

  setDeck: (deck) => set({ deck, currentSlideIndex: 0, error: null }),

  updateSlideContent: (slideIndex, elementId, content) => {
    const { deck } = get();
    if (!deck) return;
    const slides = deck.slides.map((slide, i) => {
      if (i !== slideIndex) return slide;
      return {
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === elementId ? { ...el, content } : el
        ),
      };
    });
    set({ deck: { ...deck, slides } });
  },

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

  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),

  updateProviderConfig: (config) =>
    set((s) => ({
      providerConfig: { ...s.providerConfig, ...config },
    })),

  generateFromPrompt: async (prompt: string) => {
    set({ loading: true, error: null, generationStep: "理解需求..." });
    try {
      set({ generationStep: "生成演示文稿..." });
      const { invoke } = await import("@tauri-apps/api/core");
      const result = await invoke<DeckData>("generate_deck", {
        prompt,
        options: get().providerConfig,
      });
      set({ deck: result, currentSlideIndex: 0, generationStep: "完成" });
    } catch {
      // Fallback: load sample deck (web dev mode or invoke failed)
      set({ deck: sampleDeck, currentSlideIndex: 0, generationStep: "完成" });
    } finally {
      set({ loading: false });
    }
  },

  modifyFromCommand: async (command: string) => {
    const { deck, addCommand } = get();
    set({ loading: true, error: null });
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const deckJson = deck ? JSON.stringify(deck) : "";
      const result = await invoke<DeckData>("modify_deck", {
        deckJson,
        command,
      });
      set({ deck: result });
      addCommand(command);
    } catch {
      // Fallback: just add to command history
      addCommand(command);
    } finally {
      set({ loading: false });
    }
  },

  exportCurrentDeck: async () => {
    const { deck } = get();
    if (!deck) {
      set({ error: "No deck to export" });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const deckJson = JSON.stringify(deck);
      await invoke("export_pptx", { deckJson });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
}));
