import * as vscode from "vscode";
import { docuSelector } from "../tools";
import { SlashProvider } from "./slashProvider";

export const backSlashDisposable = (context: vscode.ExtensionContext) => {
  const slashProvider = new SlashProvider(context);

  return vscode.languages.registerCompletionItemProvider(
    docuSelector,
    slashProvider,
    "/"
  );
};
