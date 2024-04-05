import React, { useEffect, useState } from "react";
import { Editor } from "./Editor/Editor";

const App = () => {
  const [vscode, setVscode] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    // eslint-disable-next-line no-undef
    const vscode = acquireVsCodeApi();
    if (!vscode) {
      console.error("No vscode found");
      return;
    }
    setVscode(vscode);
  }, []);

  useEffect(() => {
    const EventListener = (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "init":
          setContent(message.text);
        // eslint-disable-next-line no-fallthrough
        case "update":
          vscode.setState({ text: message.text });
          return;
        default:
          console.warn("Unknown message type", message.type);
      }
    };

    if (vscode) {
      window.removeEventListener("message", EventListener);
      window.addEventListener("message", EventListener);
      vscode.postMessage({ type: "readyToListen" });
      return () => window.removeEventListener("message", EventListener);
    }
  }, [vscode]);

  if (!vscode) {
    return null;
  }

  return (
    <Editor defaultValue={content} vscode={vscode} />
  );
};

export default App;
