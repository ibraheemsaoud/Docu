import * as vscode from "vscode";
import { docuSelector, isDocuFile } from "./tools";
import { generateMarkdownFile } from "./saveDocuFile";
import { BackSlashProvider } from "./backSlashProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "my-extension" is now active!');

  let disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    if (vscode.window.activeTextEditor) {
      if (isDocuFile(vscode.window.activeTextEditor)) {
        // This is an .md file, do something with the text updates
        const text = event.document.getText();
        // console.log(`Text updated: ${text}`);
      }
    }
  });

  let saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
    if (vscode.window.activeTextEditor) {
      if (isDocuFile(vscode.window.activeTextEditor)) {
        generateMarkdownFile(vscode.window.activeTextEditor);
      }
    }
  });

  const backSlashProvider = new BackSlashProvider();
  let backSlashDisposable = vscode.languages.registerCompletionItemProvider(
    docuSelector,
    backSlashProvider,
    "/"
  );

  context.subscriptions.push(disposable, saveDisposable, backSlashDisposable);
}

export function deactivate() {}
