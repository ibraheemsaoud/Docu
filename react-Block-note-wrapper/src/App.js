import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useState } from "react";

function App() {
  // this content is stored in MarkDown
  const [localContent, setLocalContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [vscode, setVscode] = useState(null);

  // Creates a new editor instance.
  const editor = useCreateBlockNote();

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
    async function setBlocks(content) {
      const blocks = await editor.tryParseMarkdownToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
    }

    const EventListener = (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "update":
          setHasLoaded(true);
          vscode.setState({ text: message.text });

          if (!isDirty) {
            setLocalContent(message.text);
            setBlocks(message.text);
          }
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
  }, [vscode, isDirty, editor, hasLoaded]);

  const onTextChange = async () => {
    // Converts the editor's contents from Block objects to Markdown and store to state.
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setLocalContent(markdown);
    const content = vscode.getState("content").text;

    if (markdown !== content) {
      setIsDirty(true);

      if (hasLoaded) {
        vscode.postMessage({
          type: "edit",
          text: markdown,
        });
      }
    }
  };

  // const onSave = () => {
  //   vscode.postMessage({
  //     type: "save",
  //     text: localContent,
  //   });
  //   setIsDirty(false);
  // };

  // Renders the editor instance using a React component.
  return (
    <div>
      {/* <div class="header">
        Docu Toolbar
        <button class="action" disabled={!isDirty} onClick={onSave}>
          Save
        </button>
      </div> */}
      <BlockNoteView editor={editor} onChange={onTextChange} />
    </div>
  );
}

export default App;
