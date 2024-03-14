import * as vscode from "vscode";
import { saveDisposable } from "./disposables/saveDisposable";
import { textChangedDisposable } from "./disposables/textChangedDisposable";
import { textSelectionDisposable } from "./disposables/slashFunctions/textSelection/textSelectionDisposable";
import { backSlashDisposable } from "./disposables/slashFunctions/backslashDisposable";
import {
  updateSelectedLines,
  updateShouldSelectLines,
} from "./disposables/tools/globalState";

export function activate(context: vscode.ExtensionContext) {
  updateShouldSelectLines(context, false);
  updateSelectedLines(context, false);

  context.subscriptions.push(
    textChangedDisposable(context),
    saveDisposable,
    backSlashDisposable(context),
    textSelectionDisposable(context)
  );
}

export function deactivate() {}
