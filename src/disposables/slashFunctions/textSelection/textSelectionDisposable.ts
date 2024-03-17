import * as vscode from "vscode";
import {
  ISelectedLines,
  getGlobalState,
  updateSelectedLines,
} from "../../tools/globalState";
import { getCurrentFileGitHubPermalink } from "../../../tools/github";

export const textSelectionDisposable = (context: vscode.ExtensionContext) => {
  return vscode.window.onDidChangeTextEditorSelection(async (event) => {
    const shouldSelectLines = getGlobalState(context).shouldSelectLines;

    if (
      // not active
      shouldSelectLines.activated !== true ||
      // is on the file that initiated the selection
      shouldSelectLines.initiatingDocuFile ===
        vscode.window.activeTextEditor?.document.fileName
    ) {
      return;
    }

    const selection = event.selections;

    // once text is selected, we should generate a permalink to it (on github)
    if (selection.length > 0) {
      const startOfLine = new vscode.Position(selection[0].start.line, 0);
      const endOfLine = new vscode.Position(
        selection[0].end.line,
        vscode.window.activeTextEditor?.document.lineAt(selection[0].end.line)
          .text.length || 0
      );
      const start = selection[0].start.line;
      const end = selection[0].end.line;

      const selectedText =
        vscode.window.activeTextEditor?.document.getText(
          new vscode.Range(startOfLine, endOfLine)
        ) || "";

      const permalink = await getCurrentFileGitHubPermalink();
      const selectedLines: ISelectedLines = {
        text: selectedText,
        permalink: permalink || "",
        file: vscode.window.activeTextEditor?.document.fileName || "",
        startLine: start,
        endLine: end,
      };

      if (start === end) {
        selectedLines.permalink = `${permalink}#L${start + 1}`;
      } else {
        selectedLines.permalink = `${permalink}#L${start + 1}-L${end + 1}`;
      }

      updateSelectedLines(context, selectedLines);
    }
  });
};
