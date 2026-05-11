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
