import * as vscode from "vscode";
import { saveDisposable } from "./disposables/saveDisposable";
import { textChangedDisposable } from "./disposables/textChangedDisposable";
import { textSelectionDisposable } from "./disposables/textSelection/textSelectionDisposable";
import { backSlashDisposable } from "./disposables/textSelection/backslashDisposable";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "my-extension" is now active!');

  context.subscriptions.push(
    textChangedDisposable,
    saveDisposable,
    backSlashDisposable(context),
    textSelectionDisposable(context)
  );
}

export function deactivate() {}
