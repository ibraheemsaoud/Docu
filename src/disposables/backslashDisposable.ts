import * as vscode from "vscode";
import { docuSelector } from "./tools";
import { BackSlashProvider } from "./backSlashProvider";

const backSlashProvider = new BackSlashProvider();

export const backSlashDisposable =
  vscode.languages.registerCompletionItemProvider(
    docuSelector,
    backSlashProvider,
    "/"
  );
