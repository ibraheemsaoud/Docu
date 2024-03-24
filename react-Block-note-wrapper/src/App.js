import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  BlockNoteView,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useState } from "react";
import {
  BlockQuote,
  fixMarkdownForBlockQuote,
  insertBlockQuote,
  markdownedBlocksToBlockBlockQuote,
  normalizeBlockQuoteBlock,
  swapMarkdownForBlockQuote,
} from "./CustomComponents/Blockquote/Blockquote";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    ...defaultBlockSpecs,
    // Adds the Alert block.
    blockquote: BlockQuote,
  },
});

function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [vscode, setVscode] = useState(null);

  // Creates a new editor instance.
  const editor = useCreateBlockNote({ schema });

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
    async function setBlocks(markdown) {
      console.log("markdown", markdown)
      let editedMarkdown = swapMarkdownForBlockQuote(markdown);
      console.log("editedMarkdown", editedMarkdown)
      let blocks = await editor.tryParseMarkdownToBlocks(editedMarkdown);
      // console.log("blocks", blocks)
      blocks = markdownedBlocksToBlockBlockQuote(blocks);
      // console.log("markdownedBlocksToBlockBlockQuote", blocks)
      editor.replaceBlocks(editor.document, blocks);
    }

    const EventListener = (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "update":
          setHasLoaded(true);
          vscode.setState({ text: message.text });
          setBlocks(message.text);
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
  }, [vscode, editor, hasLoaded]);

  const onTextChange = async () => {
    // Converts the editor's contents from Block objects to Markdown and store to state.
    let document = normalizeBlockQuoteBlock(editor.document);
    let markdown = await editor.blocksToMarkdownLossy(document);
    markdown = fixMarkdownForBlockQuote(markdown);

    const content = vscode.getState("content").text;

    if (markdown !== content && hasLoaded) {
      vscode.postMessage({
        type: "edit",
        text: markdown,
      });
    }
  };

  // Renders the editor instance using a React component.
  return (
    <div>
      <BlockNoteView editor={editor} onChange={onTextChange} slashMenu={false}>
        {/* Replaces the default Slash Menu. */}
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            // Gets all default slash menu items and `insertAlert` item.
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                insertBlockQuote(editor),
              ],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}

export default App;
