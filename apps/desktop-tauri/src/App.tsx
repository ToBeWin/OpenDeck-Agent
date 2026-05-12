import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { DeckOutline } from "./components/DeckOutline";
import { SlidePreview } from "./components/SlidePreview";
import { Inspector } from "./components/Inspector";
import { CommandBar } from "./components/CommandBar";
import { StatusBar } from "./components/StatusBar";
import { SettingsPanel } from "./components/SettingsPanel";
import { useStore } from "./store";
import "./App.css";

function App() {
  const settingsOpen = useStore((s) => s.settingsOpen);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const toggleCommandBar = useStore((s) => s.toggleCommandBar);
  const setDeck = useStore((s) => s.setDeck);
  const nextSlide = useStore((s) => s.nextSlide);
  const prevSlide = useStore((s) => s.prevSlide);
  const exportCurrentDeck = useStore((s) => s.exportCurrentDeck);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const deck = useStore((s) => s.deck);
  const commandBarOpen = useStore((s) => s.commandBarOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
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

      // Ctrl/Cmd+N — new deck
      if (mod && e.key === "n") {
        e.preventDefault();
        setDeck(null);
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
  }, [deck, commandBarOpen, toggleCommandBar, toggleSettings, setDeck, nextSlide, prevSlide, exportCurrentDeck, undo, redo]);

  return (
    <div className="app">
      <TopBar />
      <div className="workspace">
        <DeckOutline />
        <SlidePreview />
        <Inspector />
      </div>
      <CommandBar />
      <StatusBar />
      {settingsOpen && <SettingsPanel onClose={toggleSettings} />}
    </div>
  );
}

export default App;
