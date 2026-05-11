import { TopBar } from "./components/TopBar";
import { DeckOutline } from "./components/DeckOutline";
import { SlidePreview } from "./components/SlidePreview";
import { Inspector } from "./components/Inspector";
import { CommandBar } from "./components/CommandBar";
import { StatusBar } from "./components/StatusBar";
import "./App.css";

function App() {
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
    </div>
  );
}

export default App;
