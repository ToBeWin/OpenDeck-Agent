import { useState, useEffect, useRef } from "react";
import { useStore } from "../store";

export function CommandBar() {
  const commandBarOpen = useStore((s) => s.commandBarOpen);
  const toggleCommandBar = useStore((s) => s.toggleCommandBar);
  const commandHistory = useStore((s) => s.commandHistory);
  const addCommand = useStore((s) => s.addCommand);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandBar();
      }
      if (e.key === "Escape" && commandBarOpen) {
        toggleCommandBar();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [commandBarOpen, toggleCommandBar]);

  useEffect(() => {
    if (commandBarOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandBarOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      addCommand(trimmed);
      setValue("");
    }
  }

  return (
    <>
      {!commandBarOpen && (
        <div className="command-bar-trigger" onClick={toggleCommandBar}>
          <span className="command-bar-placeholder">
            输入指令修改演示文稿... (Ctrl+K)
          </span>
        </div>
      )}
      {commandBarOpen && (
        <div className="command-bar-overlay" onClick={toggleCommandBar}>
          <div
            className="command-bar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="command-bar-form">
              <input
                ref={inputRef}
                className="command-bar-input"
                type="text"
                placeholder="输入指令修改演示文稿..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button className="command-bar-submit" type="submit">
                Send
              </button>
            </form>
            {commandHistory.length > 0 && (
              <div className="command-bar-history">
                {commandHistory.map((cmd, i) => (
                  <div key={i} className="command-bar-history-item">
                    {cmd}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
