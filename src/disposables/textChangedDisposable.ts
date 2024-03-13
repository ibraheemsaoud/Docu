import * as vscode from "vscode";
import { isDocuFile } from "./tools";

export const textChangedDisposable = vscode.workspace.onDidChangeTextDocument(
  (event) => {
    if (vscode.window.activeTextEditor) {
      if (isDocuFile(vscode.window.activeTextEditor)) {
        // This is an .md file, do something with the text updates
        const text = event.document.getText();
        // console.log(`Text updated: ${text}`);
      }
    }
  }
);
