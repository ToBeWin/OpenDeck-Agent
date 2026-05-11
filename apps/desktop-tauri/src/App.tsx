import { GeneratePanel } from "./components/GeneratePanel";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>OpenDeck Agent</h1>
        <p className="subtitle">AI-Powered Presentation Generator</p>
      </header>
      <main className="main">
        <GeneratePanel />
      </main>
    </div>
  );
}

export default App;
