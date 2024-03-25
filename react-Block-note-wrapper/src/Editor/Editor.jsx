// https://codesandbox.io/p/sandbox/react-grdxqn?file=/src/index.js:11,12
import "./styles.css";
import {
  Editor as MilkEditor,
  rootCtx,
  defaultValueCtx,
} from "@milkdown/core";
import { nord } from "@milkdown/theme-nord";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";
import { gfm } from "@milkdown/preset-gfm";
import { ReactEditor, useEditor } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { prism } from "@milkdown/plugin-prism";
import { menu } from "@milkdown/plugin-menu";
import { block } from "@milkdown/plugin-block";
import slash from "./Slash";
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import { useEffect, useState } from "react";
import { replaceAll } from "@milkdown/utils";

export const Editor = ({ defaultValue, vscode }) => {
  const [content, setContent] = useState(defaultValue);

  const { editor, getInstance } = useEditor(
    (root) =>
      MilkEditor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, content);
          ctx
            .get(listenerCtx)
            .mounted((ctx) => { })
            .updated((ctx, doc, prevDoc) => {})
            .markdownUpdated((ctx, markdown, prevMarkdown) => {
              if (vscode && markdown !== content) {
                vscode.postMessage({
                  type: "edit",
                  text: markdown,
                });
              }
              setContent(markdown);
            })
        })
        .use(nord)
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener)
        .use(prism)
        .use(menu)
        .use(block)
        .use(cursor)
        .use(clipboard)
        .use(slash)
  );


  useEffect(() => {
    if (defaultValue !== content) {
      getInstance().action(replaceAll(defaultValue));
      setContent(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  return (
    <div className="App">
      <ReactEditor editor={editor} />
    </div>
  );
}
