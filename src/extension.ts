import * as vscode from "vscode";
import { saveDisposable } from "./disposables/saveDisposable";
import { backSlashDisposable } from "./disposables/backslashDisposable";
import { textChangedDisposable } from "./disposables/textChangedDisposable";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "my-extension" is now active!');

  context.subscriptions.push(
    textChangedDisposable,
    saveDisposable,
    backSlashDisposable
  );
}

export function deactivate() {}
