import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { DeckOutline } from "./components/DeckOutline";
import { SlidePreview } from "./components/SlidePreview";
import { Inspector } from "./components/Inspector";
import { CommandBar } from "./components/CommandBar";
import { StatusBar } from "./components/StatusBar";
import { SettingsPanel } from "./components/SettingsPanel";
import { PresentationMode } from "./components/PresentationMode";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { listen } from "@tauri-apps/api/event";
import { ToastProvider, useShowToast } from "./components/Toast";
import { useStore } from "./store";
import "./App.css";
import "./i18n";

function ErrorWatcher() {
  const error = useStore((s) => s.error);
  const showToast = useShowToast();
  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);
  return null;
}

function ProgressWatcher() {
  const setGenerationProgress = useStore((s) => s.setGenerationProgress);
  useEffect(() => {
    const unlisten = listen<{ step: string; detail?: string }>("generation-progress", (event) => {
      setGenerationProgress(event.payload.step, event.payload.detail);
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [setGenerationProgress]);
  return null;
}

function App() {
  const settingsOpen = useStore((s) => s.settingsOpen);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const toggleCommandBar = useStore((s) => s.toggleCommandBar);
  const nextSlide = useStore((s) => s.nextSlide);
  const prevSlide = useStore((s) => s.prevSlide);
  const exportCurrentDeck = useStore((s) => s.exportCurrentDeck);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const deck = useStore((s) => s.deck);
  const commandBarOpen = useStore((s) => s.commandBarOpen);
  const saveProject = useStore((s) => s.saveProject);
  const loadProject = useStore((s) => s.loadProject);
  const newProject = useStore((s) => s.newProject);
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Presentation mode handles its own keys
      if (presenting) return;

      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+K — toggle command bar
      if (mod && e.key === "k") {
        e.preventDefault();
        toggleCommandBar();
        return;
      }

      // Ctrl/Cmd+, — settings
      if (mod && e.key === ",") {
        e.preventDefault();
        toggleSettings();
        return;
      }

      // Ctrl/Cmd+S — save project
      if (mod && e.key === "s") {
        e.preventDefault();
        if (deck) saveProject();
        return;
      }

      // Ctrl/Cmd+O — open project
      if (mod && e.key === "o") {
        e.preventDefault();
        loadProject();
        return;
      }

      // Ctrl/Cmd+N — new deck
      if (mod && e.key === "n") {
        e.preventDefault();
        newProject();
        return;
      }

      // Ctrl/Cmd+E — export PPTX
      if (mod && e.key === "e") {
        e.preventDefault();
        if (deck) exportCurrentDeck("pptx");
        return;
      }

      // Ctrl/Cmd+Shift+E — export PDF
      if (mod && e.shiftKey && e.key === "E") {
        e.preventDefault();
        if (deck) exportCurrentDeck("pdf");
        return;
      }

      // Ctrl/Cmd+P — presentation mode
      if (mod && e.key === "p") {
        e.preventDefault();
        if (deck) setPresenting(true);
        return;
      }

      // Ctrl/Cmd+Z — undo
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y — redo
      if (mod && ((e.shiftKey && e.key === "Z") || e.key === "y")) {
        e.preventDefault();
        redo();
        return;
      }

      // Don't handle navigation when command bar is open or in input
      if (commandBarOpen) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Arrow left/right — navigate slides
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck, commandBarOpen, presenting, toggleCommandBar, toggleSettings, newProject, nextSlide, prevSlide, exportCurrentDeck, undo, redo, saveProject, loadProject]);

  if (presenting) {
    return <PresentationMode onClose={() => setPresenting(false)} />;
  }

  return (
    <ToastProvider>
      <ProgressWatcher />
      <ErrorWatcher />
      <div className="app">
        <TopBar onPresent={() => setPresenting(true)} />
        <div className="workspace">
          <ErrorBoundary>
            <DeckOutline />
          </ErrorBoundary>
          <ErrorBoundary>
            <SlidePreview />
          </ErrorBoundary>
          <ErrorBoundary>
            <Inspector />
          </ErrorBoundary>
        </div>
        <CommandBar />
        <StatusBar />
        {settingsOpen && <SettingsPanel onClose={toggleSettings} />}
      </div>
    </ToastProvider>
  );
}

export default App;
