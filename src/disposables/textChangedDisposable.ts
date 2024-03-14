import * as vscode from "vscode";
import { isDocuFile } from "./tools";
import { BACK_SLASH_CODE_SNIPPET } from "./slashFunctions/slash.const";
import {
  getGlobalState,
  updateSelectedLines,
  updateShouldSelectLines,
} from "./tools/globalState";

export const textChangedDisposable = (context: vscode.ExtensionContext) =>
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (vscode.window.activeTextEditor) {
      if (isDocuFile(vscode.window.activeTextEditor)) {
        const text = event.document.getText();
        const { selectedLines, shouldSelectLines } = getGlobalState(context);

        if (
          text.includes(BACK_SLASH_CODE_SNIPPET) &&
          selectedLines.file !== ""
        ) {
          const startPosition = new vscode.Position(
            shouldSelectLines.line,
            shouldSelectLines.character - 1
          );
          const endPosition = new vscode.Position(
            shouldSelectLines.line,
            shouldSelectLines.character + 11
          );

          const edit = new vscode.WorkspaceEdit();
          edit.replace(
            event.document.uri,
            new vscode.Range(startPosition, endPosition),
            "```" +
              selectedLines.file.split(".").pop() +
              "\n" +
              selectedLines.text +
              "\n```" +
              "\n\n"
          );

          vscode.workspace.applyEdit(edit);

          updateSelectedLines(context, false);
          updateShouldSelectLines(context, false);
        }
      }
    }
  });
