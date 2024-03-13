import * as vscode from "vscode";

export interface IContext extends vscode.ExtensionContext {
  linkToCodeCommandExecuted: boolean;
}

export function getExtensionContext(): vscode.ExtensionContext {
  const extensionId = "<your-extension-id>";
  return vscode.extensions.getExtension(extensionId)
    ?.exports as vscode.ExtensionContext;
}
