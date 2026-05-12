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
  history: DeckData[];
  future: DeckData[];
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
  updateSlideElementStyle: (slideIndex: number, elementId: string, style: Record<string, unknown>) => void;
  updateSlideLayout: (slideIndex: number, layout: string) => void;
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
  exportCurrentDeck: (format?: "pptx" | "pdf" | "html") => Promise<void>;
  undo: () => void;
  redo: () => void;
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
  history: [],
  future: [],
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

  setDeck: (deck) => set({ deck, currentSlideIndex: 0, error: null, history: [], future: [] }),

  updateSlideContent: (slideIndex, elementId, content) => {
    const { deck, history } = get();
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
    set({ deck: { ...deck, slides }, history: [...history, deck].slice(-50), future: [] });
  },

  updateSlideElementStyle: (slideIndex, elementId, style) => {
    const { deck, history } = get();
    if (!deck) return;
    const slides = deck.slides.map((slide, i) => {
      if (i !== slideIndex) return slide;
      return {
        ...slide,
        elements: slide.elements.map((el) =>
          el.id === elementId
            ? { ...el, style: { ...(el.style ?? {}), ...style } }
            : el
        ),
      };
    });
    set({ deck: { ...deck, slides }, history: [...history, deck].slice(-50), future: [] });
  },

  updateSlideLayout: (slideIndex, layout) => {
    const { deck, history } = get();
    if (!deck) return;
    const slides = deck.slides.map((slide, i) => {
      if (i !== slideIndex) return slide;
      return { ...slide, layout };
    });
    set({ deck: { ...deck, slides }, history: [...history, deck].slice(-50), future: [] });
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
    const config = get().providerConfig;
    const themeMap: Record<string, string> = {
      "Bloomberg Dark": "bloomberg_dark",
      "Apple Keynote": "apple_keynote",
      "McKinsey Consulting": "mckinsey_consulting",
      "Dark Elegance": "dark_elegance",
      "Minimal Light": "minimal_light",
      "Tech Gradient": "tech_gradient",
    };
    set({ loading: true, error: null, generationStep: "理解需求..." });
    try {
      set({ generationStep: "规划结构..." });
      const { generateDeck } = await import("./lib/tauri");
      const result = await generateDeck(prompt, {
        provider: config.provider,
        language: config.language,
        theme: themeMap[config.theme] ?? "bloomberg_dark",
      });
      const deck = (result as { deck: DeckData }).deck;
      set({ deck, currentSlideIndex: 0, generationStep: "完成" });
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

  exportCurrentDeck: async (format: "pptx" | "pdf" | "html" = "pptx") => {
    const { deck } = get();
    if (!deck) {
      set({ error: "No deck to export" });
      return;
    }
    set({ loading: true, error: null });
    try {
      const deckJson = JSON.stringify(deck);
      if (format === "pdf") {
        const { exportPdf } = await import("./lib/tauri");
        await exportPdf(deckJson);
      } else if (format === "html") {
        const { exportHtml } = await import("./lib/tauri");
        await exportHtml(deckJson);
      } else {
        const { exportPptx } = await import("./lib/tauri");
        await exportPptx(deckJson);
      }
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  undo: () => {
    const { history, deck, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      deck: prev,
      history: history.slice(0, -1),
      future: deck ? [deck, ...future] : future,
    });
  },

  redo: () => {
    const { future, deck, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      deck: next,
      future: future.slice(1),
      history: deck ? [...history, deck] : history,
    });
  },
}));
