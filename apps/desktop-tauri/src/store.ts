import { create } from "zustand";
import type { DeckData, ElementData } from "./types";

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
  projectPath: string | null;
  dirty: boolean;
  providerConfig: {
    provider: "mock" | "ollama" | "openai" | "anthropic" | "gemini" | "deepseek" | "kimi" | "qwen" | "glm-domestic" | "glm-international" | "minimax-domestic" | "minimax-international" | "openrouter" | "lmstudio" | "vllm";
    ollamaBaseUrl: string;
    ollamaModel: string;
    openaiApiKey: string;
    openaiBaseUrl: string;
    openaiModel: string;
    kimiApiKey: string;
    kimiBaseUrl: string;
    kimiModel: string;
    glmDomesticApiKey: string;
    glmDomesticBaseUrl: string;
    glmDomesticModel: string;
    glmInternationalApiKey: string;
    glmInternationalBaseUrl: string;
    glmInternationalModel: string;
    minimaxDomesticApiKey: string;
    minimaxDomesticBaseUrl: string;
    minimaxDomesticModel: string;
    minimaxInternationalApiKey: string;
    minimaxInternationalBaseUrl: string;
    minimaxInternationalModel: string;
    anthropicApiKey: string;
    anthropicBaseUrl: string;
    anthropicModel: string;
    geminiApiKey: string;
    geminiBaseUrl: string;
    geminiModel: string;
    deepseekApiKey: string;
    deepseekBaseUrl: string;
    deepseekModel: string;
    qwenApiKey: string;
    qwenBaseUrl: string;
    qwenModel: string;
    openrouterApiKey: string;
    openrouterBaseUrl: string;
    openrouterModel: string;
    lmstudioApiKey: string;
    lmstudioBaseUrl: string;
    lmstudioModel: string;
    vllmApiKey: string;
    vllmBaseUrl: string;
    vllmModel: string;
    language: "zh" | "en" | "bilingual";
    uilanguage: "zh" | "en";
    theme: string;
  };

  setDeck: (deck: DeckData | null) => void;
  setUILanguage: (lang: "zh" | "en") => void;
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
  saveProject: () => Promise<void>;
  loadProject: () => Promise<void>;
  newProject: () => void;
  generateImageForSlide: (slideIndex: number, prompt: string) => Promise<void>;
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
  projectPath: null,
  dirty: false,
  providerConfig: {
    provider: "mock",
    ollamaBaseUrl: "http://localhost:11434",
    ollamaModel: "llama3",
    openaiApiKey: "",
    openaiBaseUrl: "https://api.openai.com/v1",
    openaiModel: "gpt-4o",
    kimiApiKey: "",
    kimiBaseUrl: "https://api.moonshot.cn/v1",
    kimiModel: "moonshot-v1-8k",
    glmDomesticApiKey: "",
    glmDomesticBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
    glmDomesticModel: "glm-4-plus",
    glmInternationalApiKey: "",
    glmInternationalBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
    glmInternationalModel: "glm-4-plus",
    minimaxDomesticApiKey: "",
    minimaxDomesticBaseUrl: "https://api.minimax.chat/v1",
    minimaxDomesticModel: "MiniMax-Text-01",
    minimaxInternationalApiKey: "",
    minimaxInternationalBaseUrl: "https://api.minimax.chat/v1",
    minimaxInternationalModel: "MiniMax-Text-01",
    anthropicApiKey: "",
    anthropicBaseUrl: "https://api.anthropic.com/v1",
    anthropicModel: "claude-3-5-sonnet-20241022",
    geminiApiKey: "",
    geminiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    geminiModel: "gemini-1.5-flash",
    deepseekApiKey: "",
    deepseekBaseUrl: "https://api.deepseek.com/v1",
    deepseekModel: "deepseek-chat",
    qwenApiKey: "",
    qwenBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    qwenModel: "qwen-plus",
    openrouterApiKey: "",
    openrouterBaseUrl: "https://openrouter.ai/api/v1",
    openrouterModel: "openai/gpt-4o-mini",
    lmstudioApiKey: "",
    lmstudioBaseUrl: "http://localhost:1234/v1",
    lmstudioModel: "local-model",
    vllmApiKey: "",
    vllmBaseUrl: "http://localhost:8000/v1",
    vllmModel: "meta-llama/Meta-Llama-3-8B-Instruct",
    language: "zh",
    uilanguage: "zh",
    theme: "Bloomberg Dark",
  },

  setUILanguage: (lang) => {
    import("i18next").then((i18n) => i18n.default.changeLanguage(lang));
    set((s) => ({ providerConfig: { ...s.providerConfig, uilanguage: lang } }));
  },

  setDeck: (deck) => set({ deck, currentSlideIndex: 0, error: null, history: [], future: [], dirty: false }),

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
    set({ deck: { ...deck, slides }, history: [...history, deck].slice(-50), future: [], dirty: true });
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
    set({ deck: { ...deck, slides }, history: [...history, deck].slice(-50), future: [], dirty: true });
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

    // Build provider-specific config
    const providerConfig: Record<string, string | undefined> = {
      provider: config.provider,
      language: config.language,
      theme: themeMap[config.theme] ?? "bloomberg_dark",
    };

    // Pass through API config based on selected provider
    switch (config.provider) {
      case "openai":
        providerConfig["apiKey"] = config.openaiApiKey;
        providerConfig["baseUrl"] = config.openaiBaseUrl;
        providerConfig["model"] = config.openaiModel;
        break;
      case "anthropic":
        providerConfig["apiKey"] = config.anthropicApiKey;
        providerConfig["baseUrl"] = config.anthropicBaseUrl;
        providerConfig["model"] = config.anthropicModel;
        break;
      case "gemini":
        providerConfig["apiKey"] = config.geminiApiKey;
        providerConfig["baseUrl"] = config.geminiBaseUrl;
        providerConfig["model"] = config.geminiModel;
        break;
      case "deepseek":
        providerConfig["apiKey"] = config.deepseekApiKey;
        providerConfig["baseUrl"] = config.deepseekBaseUrl;
        providerConfig["model"] = config.deepseekModel;
        break;
      case "kimi":
        providerConfig["apiKey"] = config.kimiApiKey;
        providerConfig["baseUrl"] = config.kimiBaseUrl;
        providerConfig["model"] = config.kimiModel;
        break;
      case "qwen":
        providerConfig["apiKey"] = config.qwenApiKey;
        providerConfig["baseUrl"] = config.qwenBaseUrl;
        providerConfig["model"] = config.qwenModel;
        break;
      case "glm-domestic":
        providerConfig["apiKey"] = config.glmDomesticApiKey;
        providerConfig["baseUrl"] = config.glmDomesticBaseUrl;
        providerConfig["model"] = config.glmDomesticModel;
        break;
      case "glm-international":
        providerConfig["apiKey"] = config.glmInternationalApiKey;
        providerConfig["baseUrl"] = config.glmInternationalBaseUrl;
        providerConfig["model"] = config.glmInternationalModel;
        break;
      case "minimax-domestic":
        providerConfig["apiKey"] = config.minimaxDomesticApiKey;
        providerConfig["baseUrl"] = config.minimaxDomesticBaseUrl;
        providerConfig["model"] = config.minimaxDomesticModel;
        break;
      case "minimax-international":
        providerConfig["apiKey"] = config.minimaxInternationalApiKey;
        providerConfig["baseUrl"] = config.minimaxInternationalBaseUrl;
        providerConfig["model"] = config.minimaxInternationalModel;
        break;
      case "openrouter":
        providerConfig["apiKey"] = config.openrouterApiKey;
        providerConfig["baseUrl"] = config.openrouterBaseUrl;
        providerConfig["model"] = config.openrouterModel;
        break;
      case "lmstudio":
        providerConfig["apiKey"] = config.lmstudioApiKey;
        providerConfig["baseUrl"] = config.lmstudioBaseUrl;
        providerConfig["model"] = config.lmstudioModel;
        break;
      case "vllm":
        providerConfig["apiKey"] = config.vllmApiKey;
        providerConfig["baseUrl"] = config.vllmBaseUrl;
        providerConfig["model"] = config.vllmModel;
        break;
    }

    set({ loading: true, error: null, generationStep: "understanding" });
    try {
      set({ generationStep: "planning" });
      const { generateDeck } = await import("./lib/tauri");
      const result = await generateDeck(prompt, providerConfig);
      const deck = (result as { deck: DeckData }).deck;
      if (!deck) throw new Error("Generation returned empty result");
      set({ deck, currentSlideIndex: 0, generationStep: "complete" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg, generationStep: null });
    } finally {
      set({ loading: false });
    }
  },

  modifyFromCommand: async (command: string) => {
    const { deck, addCommand } = get();
    if (!deck) { set({ error: "No deck to modify" }); return; }
    set({ loading: true, error: null });
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const deckJson = JSON.stringify(deck);
      const result = await invoke<DeckData>("modify_deck", {
        deckJson,
        command,
      });
      set({ deck: result, dirty: true });
      addCommand(command);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: `Modify failed: ${msg}` });
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

  saveProject: async () => {
    const { deck } = get();
    if (!deck) return;
    set({ loading: true, error: null });
    try {
      const { saveProject } = await import("./lib/tauri");
      const path = await saveProject(deck, deck.title);
      set({ projectPath: path as string, dirty: false, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  loadProject: async () => {
    set({ loading: true, error: null });
    try {
      const { loadProject, listProjects } = await import("./lib/tauri");
      const projects = await listProjects();
      if (projects.length === 0) {
        set({ error: "No saved projects found", loading: false });
        return;
      }
      // Load the most recent project
      const latest = projects[projects.length - 1];
      const deck = (await loadProject(latest.path)) as DeckData;
      set({
        deck,
        projectPath: latest.path,
        dirty: false,
        currentSlideIndex: 0,
        history: [],
        future: [],
        loading: false,
      });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  newProject: () => {
    set({
      deck: null,
      projectPath: null,
      dirty: false,
      currentSlideIndex: 0,
      history: [],
      future: [],
      error: null,
    });
  },

  generateImageForSlide: async (slideIndex, prompt) => {
    const { deck, providerConfig } = get();
    if (!deck || !deck.slides[slideIndex]) return;
    set({ loading: true, error: null });
    try {
      const { generateImage } = await import("./lib/tauri");
      const result = await generateImage({
        prompt,
        apiKey: providerConfig.openaiApiKey,
        imageProvider: providerConfig.openaiApiKey ? "openai" : "mock",
        width: 1024,
        height: 1024,
      });

      const newEl: ElementData = {
        id: `img_${Date.now()}`,
        type: "image",
        role: "hero",
        source: result.base64 || result.url,
        generationPrompt: prompt,
      };

      const slides = deck.slides.map((slide, i) => {
        if (i !== slideIndex) return slide;
        return { ...slide, elements: [...slide.elements, newEl] };
      });

      set({
        deck: { ...deck, slides },
        history: [...get().history, deck].slice(-50),
        future: [],
        dirty: true,
        loading: false,
      });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
