import * as vscode from "vscode";
import { isDocuFile } from "./tools";
import { generateMarkdownFile } from "./saveDocuFile";

export const saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.window.activeTextEditor) {
    if (isDocuFile(vscode.window.activeTextEditor)) {
      generateMarkdownFile(vscode.window.activeTextEditor);
    }
  }
});
