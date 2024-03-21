import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useState } from "react";

function App() {
  const [content, setContent] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [hasLostSync, setHasLostSync] = useState(false);

  const EventListener = (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        if (!isDirty) {
          setLocalContent(message.text);
          setHasLostSync(true);
        }
        setContent(message.text);
        window.vscode.setState({ text: message.text });
        return;
      default:
        console.warn("Unknown message type", message.type);
    }
  };

  useEffect(() => {
    if (window.vscode) {
      window.addEventListener("message", EventListener);
    } else {
      console.warn("No 'vscode' global variable found");
    }
  }, []);

  // Creates a new editor instance.
  const editor = useCreateBlockNote();

  const onTextChange = async () => {
    // Converts the editor's contents from Block objects to Markdown and store to state.
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setLocalContent(markdown);
  };

  const onSave = () => {
    window.vscode.postMessage({
      type: "save",
      text: localContent,
    });
    setIsDirty(false);
    setHasLostSync(false);
  };

  // Renders the editor instance using a React component.
  return (
    <div>
      <div class="header">
        Docu Toolbar
        {hasLostSync && (
          <span>
            {" "}
            document is outdated, if you save it will override what is there
            now.
          </span>
        )}
        <button class="action" disabled={isDirty} onclick={onSave}>
          Save
        </button>
      </div>
      <BlockNoteView
        editor={editor}
        defaultValue={editor.tryParseMarkdownToBlocks(content)}
        onChange={onTextChange}
      />
    </div>
  );
}

export default App;
